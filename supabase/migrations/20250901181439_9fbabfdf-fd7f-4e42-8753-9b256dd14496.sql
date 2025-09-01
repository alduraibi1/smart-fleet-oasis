
-- 1) إنشاء جدول الفئات
CREATE TABLE public.inventory_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- فهرس اختياري وفريد على الاسم لمنع التكرار
CREATE UNIQUE INDEX IF NOT EXISTS inventory_categories_name_key ON public.inventory_categories (name);

-- تفعيل RLS
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول
-- السماح بالقراءة لأي مستخدم مُصدّق
CREATE POLICY "inventory_categories_select_authenticated"
  ON public.inventory_categories
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- السماح بالإدراج للمدير أو المشرف
CREATE POLICY "inventory_categories_insert_managers_admins"
  ON public.inventory_categories
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- السماح بالتحديث للمدير أو المشرف
CREATE POLICY "inventory_categories_update_managers_admins"
  ON public.inventory_categories
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- السماح بالحذف للمدير أو المشرف
CREATE POLICY "inventory_categories_delete_managers_admins"
  ON public.inventory_categories
  FOR DELETE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Trigger لتحديث updated_at
CREATE TRIGGER update_inventory_categories_updated_at
BEFORE UPDATE ON public.inventory_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) العلاقات (Foreign Keys) والفهارس

-- ربط العناصر بالفئات
ALTER TABLE public.inventory_items
  ADD CONSTRAINT inventory_items_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES public.inventory_categories(id)
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_items_category_id
  ON public.inventory_items (category_id);

-- ربط العناصر بالموردين (اختياري لكنه مفيد لتمكين العلاقات المتداخلة)
ALTER TABLE public.inventory_items
  ADD CONSTRAINT inventory_items_supplier_id_fkey
  FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id)
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier_id
  ON public.inventory_items (supplier_id);

-- ربط الحركات بالعناصر
ALTER TABLE public.stock_transactions
  ADD CONSTRAINT stock_transactions_item_id_fkey
  FOREIGN KEY (item_id) REFERENCES public.inventory_items(id)
  ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_stock_transactions_item_id
  ON public.stock_transactions (item_id);

-- 3) إدراج فئات افتراضية
INSERT INTO public.inventory_categories (name, description) VALUES
  ('قطع غيار', 'قطع الغيار الميكانيكية والكهربائية'),
  ('زيوت ومواد', 'زيوت المحركات والمواد الاستهلاكية'),
  ('إطارات', 'الإطارات ومستلزماتها')
ON CONFLICT DO NOTHING;
