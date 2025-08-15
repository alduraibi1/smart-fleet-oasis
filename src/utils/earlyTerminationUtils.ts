
export interface MinimalContractForEarlyTermination {
  id: string;
  customer_id: string;
  vehicle_id: string;
  start_date: string; // ISO yyyy-mm-dd
  end_date: string;   // ISO yyyy-mm-dd
  daily_rate: number;
  total_amount: number;
  minimum_rental_period?: number | null;
  early_termination_fee?: number | null;
  termination_policy?: string | null;
}

export interface EarlyTerminationBreakdown {
  daysUsed: number;
  minimumDays: number;
  dailyRate: number;
  baseProrated: number;
  minimumCharge: number;
  fee: number;
  totalDue: number;
  policy: string;
  notes: string[];
}

export const diffDaysInclusive = (startISO: string, endISO: string) => {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const ms = end.getTime() - start.getTime();
  // Use ceil to count partial days as full for rentals
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Math.max(days, 0);
};

export const calculateProRatedCharge = (dailyRate: number, days: number) => {
  return Math.max(Math.round(dailyRate * days), 0);
};

export const calculateMinimumPeriodCharge = (dailyRate: number, minimumDays: number) => {
  return Math.max(Math.round(dailyRate * minimumDays), 0);
};

export const calculateEarlyTerminationCharges = (
  contract: MinimalContractForEarlyTermination,
  requestedTerminationDateISO: string
): EarlyTerminationBreakdown => {
  const minimumDays = contract.minimum_rental_period ?? 90;
  const fee = Math.round((contract.early_termination_fee ?? 0) || 0);
  const policy = (contract.termination_policy ?? 'standard').toLowerCase();

  // Days used are from start_date up to requested termination date
  const daysUsed = diffDaysInclusive(contract.start_date, requestedTerminationDateISO);
  const dailyRate = contract.daily_rate;

  const baseProrated = calculateProRatedCharge(dailyRate, daysUsed);
  const minimumCharge = calculateMinimumPeriodCharge(dailyRate, minimumDays);

  let totalDue = baseProrated;
  const notes: string[] = [];

  if (policy === 'standard') {
    if (daysUsed < minimumDays) {
      totalDue = minimumCharge;
      notes.push('تم تطبيق الحد الأدنى لفترة الإيجار.');
    } else {
      notes.push('تم احتساب المبلغ على أساس الأيام الفعلية.');
    }
  } else if (policy === 'strict') {
    // Example: strict always minimum
    totalDue = minimumCharge;
    notes.push('سياسة صارمة: تطبيق الحد الأدنى دائماً.');
  } else if (policy === 'flex') {
    // Example: flex chooses lower of prorated vs minimum
    totalDue = Math.min(baseProrated, minimumCharge);
    notes.push('سياسة مرنة: تم اختيار الأقل بين الحد الأدنى والمبلغ الفعلي.');
  } else {
    // Fallback behaves like standard
    if (daysUsed < minimumDays) {
      totalDue = minimumCharge;
      notes.push('تم تطبيق الحد الأدنى لفترة الإيجار.');
    } else {
      notes.push('تم احتساب المبلغ على أساس الأيام الفعلية.');
    }
  }

  totalDue += fee;
  if (fee > 0) notes.push('تم إضافة رسوم الإلغاء المبكر.');

  return {
    daysUsed,
    minimumDays,
    dailyRate,
    baseProrated,
    minimumCharge,
    fee,
    totalDue,
    policy,
    notes
  };
};
