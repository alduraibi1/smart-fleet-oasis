
-- 1) دالة لضمان وجود الحساب بالدليل وإرجاع معرّفه
create or replace function public.ensure_account(p_code text, p_name text, p_type text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  select id into v_id from public.chart_of_accounts where account_code = p_code limit 1;
  if v_id is null then
    insert into public.chart_of_accounts (account_code, account_name, account_type, is_active)
    values (p_code, p_name, p_type, true)
    returning id into v_id;
  end if;
  return v_id;
end;
$$;

-- 2) دالة لتوليد رقم قيد يومي
create or replace function public.generate_journal_entry_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  seq_num text;
begin
  select lpad((count(*) + 1)::text, 6, '0')
  into seq_num
  from public.journal_entries
  where entry_date = current_date;
  return 'JE-' || to_char(current_date, 'YYYYMMDD') || '-' || seq_num;
end;
$$;

-- 3) فهرس يمنع الازدواجية في المعاملات المحاسبية لنفس المرجع ونوع العملية
create unique index if not exists ux_acc_tx_ref
on public.accounting_transactions (reference_type, reference_id, transaction_type);

-- 4) قيود محاسبية لعقد جديد (إثبات الإيراد + مدينون)
create or replace function public.acc_create_contract_entry(p_contract_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  c record;
  v_owner_id uuid;
  v_ar uuid;
  v_rev uuid;
  v_je_id uuid;
  v_created_by uuid;
begin
  -- تفادي الازدواجية
  if exists (
    select 1 from public.accounting_transactions
    where reference_type = 'rental_contract'
      and reference_id = p_contract_id
      and transaction_type = 'contract_revenue'
  ) then
    return null;
  end if;

  select rc.*, v.owner_id
  into c
  from public.rental_contracts rc
  left join public.vehicles v on v.id = rc.vehicle_id
  where rc.id = p_contract_id;

  if not found then
    return null;
  end if;

  v_ar  := public.ensure_account('110100', 'Accounts Receivable', 'asset');
  v_rev := public.ensure_account('400100', 'Rental Revenue', 'revenue');

  v_created_by := coalesce(c.created_by, auth.uid());

  insert into public.journal_entries (
    entry_date, entry_number, description, reference_id, reference_type, status, total_amount, created_by
  ) values (
    c.start_date::date,
    public.generate_journal_entry_number(),
    'إثبات إيراد عقد رقم ' || coalesce(c.contract_number, ''),
    c.id,
    'rental_contract',
    'posted',
    c.total_amount,
    v_created_by
  ) returning id into v_je_id;

  insert into public.journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, line_order, description)
  values 
    (v_je_id, v_ar,  c.total_amount, 0, 1, 'مدينون - العقد'),
    (v_je_id, v_rev, 0, c.total_amount, 2, 'إيرادات إيجار');

  insert into public.accounting_transactions (
    transaction_date, reference_id, amount, vehicle_id, customer_id, owner_id, contract_id,
    debit_account, credit_account, created_by, status, transaction_type, reference_number, description,
    account_type, account_category
  ) values (
    c.start_date::date,
    c.id,
    c.total_amount,
    c.vehicle_id,
    c.customer_id,
    c.owner_id,
    c.id,
    v_ar,
    v_rev,
    v_created_by,
    'posted',
    'contract_revenue',
    coalesce(c.contract_number, ''),
    'إثبات إيراد عقد إيجار',
    'revenue',
    'rental'
  );

  return v_je_id;
end;
$$;

-- 5) قيود محاسبية لسند قبض (تحصيل نقدي مقابل المدينون)
create or replace function public.acc_create_receipt_entry(p_receipt_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  c record;
  v_cash uuid;
  v_ar uuid;
  v_je_id uuid;
  v_created_by uuid;
begin
  -- تفادي الازدواجية
  if exists (
    select 1 from public.accounting_transactions
    where reference_type = 'payment_receipt'
      and reference_id = p_receipt_id
      and transaction_type = 'receipt'
  ) then
    return null;
  end if;

  select pr.*
  into r
  from public.payment_receipts pr
  where pr.id = p_receipt_id;

  if not found then
    return null;
  end if;

  select rc.*, v.owner_id
  into c
  from public.rental_contracts rc
  left join public.vehicles v on v.id = rc.vehicle_id
  where rc.id = r.contract_id;

  v_cash := public.ensure_account('100100', 'Cash on Hand', 'asset');
  v_ar   := public.ensure_account('110100', 'Accounts Receivable', 'asset');

  v_created_by := coalesce(r.issued_by, auth.uid(), c.created_by);

  insert into public.journal_entries (
    entry_date, entry_number, description, reference_id, reference_type, status, total_amount, created_by
  ) values (
    coalesce(r.payment_date, current_date),
    public.generate_journal_entry_number(),
    'سند قبض ' || coalesce(r.receipt_number, ''),
    r.id,
    'payment_receipt',
    'posted',
    r.amount,
    v_created_by
  ) returning id into v_je_id;

  insert into public.journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, line_order, description)
  values 
    (v_je_id, v_cash, r.amount, 0, 1, 'نقدية/بنك'),
    (v_je_id, v_ar,   0, r.amount, 2, 'تسوية مدينون');

  insert into public.accounting_transactions (
    transaction_date, reference_id, amount, vehicle_id, customer_id, owner_id, contract_id,
    debit_account, credit_account, created_by, status, transaction_type, reference_number, description,
    account_type, account_category
  ) values (
    coalesce(r.payment_date, current_date),
    r.id,
    r.amount,
    r.vehicle_id,
    r.customer_id,
    c.owner_id,
    r.contract_id,
    v_cash,
    v_ar,
    v_created_by,
    'posted',
    'receipt',
    coalesce(r.receipt_number, ''),
    'تحصيل نقدي من العميل',
    'asset',
    'cash'
  );

  return v_je_id;
end;
$$;

-- 6) قيود محاسبية لإتمام الصيانة (قيد مصروف + دائنون)
create or replace function public.acc_create_maintenance_entry(p_maintenance_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  m record;
  v_exp uuid;
  v_ap uuid;
  v_je_id uuid;
  v_amount numeric;
  v_created_by uuid;
begin
  -- تفادي الازدواجية
  if exists (
    select 1 from public.accounting_transactions
    where reference_type = 'vehicle_maintenance'
      and reference_id = p_maintenance_id
      and transaction_type = 'maintenance_expense'
  ) then
    return null;
  end if;

  select vm.*
  into m
  from public.vehicle_maintenance vm
  where vm.id = p_maintenance_id;

  if not found then
    return null;
  end if;

  if m.total_cost is null and m.labor_cost is null and m.parts_cost is null then
    return null;
  end if;

  v_amount := coalesce(m.total_cost, 0) + coalesce(m.labor_cost, 0) + coalesce(m.parts_cost, 0);
  if v_amount <= 0 then
    return null;
  end if;

  v_exp := public.ensure_account('500200', 'Maintenance Expense', 'expense');
  v_ap  := public.ensure_account('220100', 'Accounts Payable', 'liability');

  v_created_by := coalesce(m.created_by, auth.uid());

  insert into public.journal_entries (
    entry_date, entry_number, description, reference_id, reference_type, status, total_amount, created_by
  ) values (
    coalesce(m.completed_date, current_date),
    public.generate_journal_entry_number(),
    'تكلفة صيانة للمركبة',
    m.id,
    'vehicle_maintenance',
    'posted',
    v_amount,
    v_created_by
  ) returning id into v_je_id;

  insert into public.journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, line_order, description)
  values 
    (v_je_id, v_exp, v_amount, 0, 1, 'مصروف صيانة'),
    (v_je_id, v_ap,  0, v_amount, 2, 'دائنون/ورشة');

  insert into public.accounting_transactions (
    transaction_date, reference_id, amount, vehicle_id, customer_id, owner_id, contract_id,
    debit_account, credit_account, created_by, status, transaction_type, reference_number, description,
    account_type, account_category
  ) values (
    coalesce(m.completed_date, current_date),
    m.id,
    v_amount,
    m.vehicle_id,
    null,
    null,
    null,
    v_exp,
    v_ap,
    v_created_by,
    'posted',
    'maintenance_expense',
    null,
    'إثبات تكلفة صيانة',
    'expense',
    'maintenance'
  );

  return v_je_id;
end;
$$;

-- 7) قيود محاسبية لحركات المخزون
create or replace function public.acc_create_stock_transaction_entry(p_tx_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  t record;
  v_inv uuid;
  v_exp uuid;
  v_ap  uuid;
  v_cash uuid;
  v_je_id uuid;
  v_amount numeric;
  v_created_by uuid;
  v_debit uuid;
  v_credit uuid;
  v_desc text;
  v_tx_type text;
begin
  -- تفادي الازدواجية
  if exists (
    select 1 from public.accounting_transactions
    where reference_type = 'stock_transaction'
      and reference_id = p_tx_id
      and transaction_type = 'stock'
  ) then
    return null;
  end if;

  select st.*
  into t
  from public.stock_transactions st
  where st.id = p_tx_id;

  if not found then
    return null;
  end if;

  v_amount := coalesce(t.total_cost, coalesce(t.unit_cost,0) * coalesce(t.quantity,0), 0);
  if v_amount <= 0 then
    return null;
  end if;

  v_inv  := public.ensure_account('130100', 'Inventory', 'asset');
  v_exp  := public.ensure_account('500200', 'Maintenance Expense', 'expense');
  v_ap   := public.ensure_account('220100', 'Accounts Payable', 'liability');
  v_cash := public.ensure_account('100100', 'Cash on Hand', 'asset');

  v_created_by := coalesce(t.performed_by, auth.uid());
  v_tx_type := lower(coalesce(t.transaction_type, ''));

  if v_tx_type in ('purchase','in') then
    v_debit := v_inv;
    -- نُسجّل كدائنون افتراضياً (يمكن تسويته لاحقاً عند الدفع)
    v_credit := v_ap;
    v_desc := 'استلام مخزون';
  elsif v_tx_type in ('issue','usage','out') then
    v_debit := v_exp;
    v_credit := v_inv;
    v_desc := 'صرف مخزون للاستخدام';
  else
    -- لا ندعم أنواع أخرى حالياً
    return null;
  end if;

  insert into public.journal_entries (
    entry_date, entry_number, description, reference_id, reference_type, status, total_amount, created_by
  ) values (
    coalesce(t.transaction_date, current_date),
    public.generate_journal_entry_number(),
    v_desc,
    t.id,
    'stock_transaction',
    'posted',
    v_amount,
    v_created_by
  ) returning id into v_je_id;

  insert into public.journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, line_order, description)
  values 
    (v_je_id, v_debit,  v_amount, 0, 1, v_desc),
    (v_je_id, v_credit, 0, v_amount, 2, v_desc);

  insert into public.accounting_transactions (
    transaction_date, reference_id, amount, vehicle_id, customer_id, owner_id, contract_id,
    debit_account, credit_account, created_by, status, transaction_type, reference_number, description,
    account_type, account_category
  ) values (
    coalesce(t.transaction_date, current_date),
    t.id,
    v_amount,
    null,
    null,
    null,
    null,
    v_debit,
    v_credit,
    v_created_by,
    'posted',
    'stock',
    null,
    v_desc,
    case when v_debit = v_inv then 'asset' else 'expense' end,
    'inventory'
  );

  return v_je_id;
end;
$$;

-- 8) دوال تريجر لاستدعاء الدوال المحاسبية أعلاه

-- عقد جديد
create or replace function public.trg_acc_on_contract_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.acc_create_contract_entry(NEW.id);
  return NEW;
end;
$$;

drop trigger if exists trg_acc_contract_insert on public.rental_contracts;
create trigger trg_acc_contract_insert
after insert on public.rental_contracts
for each row
execute function public.trg_acc_on_contract_insert();

-- سند قبض جديد
create or replace function public.trg_acc_on_receipt_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.acc_create_receipt_entry(NEW.id);
  return NEW;
end;
$$;

drop trigger if exists trg_acc_receipt_insert on public.payment_receipts;
create trigger trg_acc_receipt_insert
after insert on public.payment_receipts
for each row
execute function public.trg_acc_on_receipt_insert();

-- إتمام الصيانة
create or replace function public.trg_acc_on_maintenance_complete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.status = 'completed' and coalesce(OLD.status,'') <> 'completed' then
    perform public.acc_create_maintenance_entry(NEW.id);
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_acc_maintenance_update on public.vehicle_maintenance;
create trigger trg_acc_maintenance_update
after update of status on public.vehicle_maintenance
for each row
when (NEW.status = 'completed')
execute function public.trg_acc_on_maintenance_complete();

-- حركة مخزون
create or replace function public.trg_acc_on_stock_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.acc_create_stock_transaction_entry(NEW.id);
  return NEW;
end;
$$;

drop trigger if exists trg_acc_stock_insert on public.stock_transactions;
create trigger trg_acc_stock_insert
after insert on public.stock_transactions
for each row
execute function public.trg_acc_on_stock_insert();
