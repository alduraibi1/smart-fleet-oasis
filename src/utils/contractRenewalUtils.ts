
export interface RenewalEligibility {
  canRenew: boolean;
  canExtend: boolean;
  reasons: string[];
  suggestions: string[];
}

export const checkRenewalEligibility = (contract: {
  status: string;
  end_date: string;
  customer?: { blacklisted?: boolean };
  vehicle?: { status: string };
}): RenewalEligibility => {
  const result: RenewalEligibility = {
    canRenew: false,
    canExtend: false,
    reasons: [],
    suggestions: []
  };

  // Check contract status eligibility
  if (['expired', 'completed'].includes(contract.status)) {
    result.canRenew = true;
    result.suggestions.push('يمكن تجديد العقد لإنشاء عقد جديد');
  }

  if (contract.status === 'active') {
    result.canExtend = true;
    result.suggestions.push('يمكن تمديد العقد الحالي');
  }

  // Check customer eligibility
  if (contract.customer?.blacklisted) {
    result.canRenew = false;
    result.canExtend = false;
    result.reasons.push('العميل مدرج في القائمة السوداء');
  }

  // Check vehicle availability
  if (contract.vehicle?.status === 'maintenance') {
    result.reasons.push('المركبة قيد الصيانة حالياً');
  }

  // Check date-based eligibility
  const endDate = new Date(contract.end_date);
  const today = new Date();
  const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry > 30 && contract.status === 'active') {
    result.suggestions.push('العقد ما زال ساري المفعول لفترة طويلة');
  }

  if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
    result.suggestions.push('العقد سينتهي قريباً - يُنصح بالتجهيز للتجديد');
  }

  return result;
};

export const calculateRenewalPricing = (originalRate: number, renewalType: 'renewal' | 'extension') => {
  // Basic pricing logic - can be enhanced based on business rules
  let adjustmentPercentage = 0;
  
  if (renewalType === 'renewal') {
    // Small increase for renewals (market adjustment)
    adjustmentPercentage = 0.05; // 5% increase
  }
  
  return {
    suggestedRate: Math.round(originalRate * (1 + adjustmentPercentage)),
    adjustmentPercentage: adjustmentPercentage * 100,
    minRate: Math.round(originalRate * 0.9), // 10% discount minimum
    maxRate: Math.round(originalRate * 1.2)   // 20% increase maximum
  };
};

export const generateRenewalSuggestions = (contract: {
  daily_rate: number;
  total_amount: number;
  start_date: string;
  end_date: string;
  customer?: { total_rentals?: number };
}): string[] => {
  const suggestions: string[] = [];
  
  // Customer loyalty suggestions
  if (contract.customer?.total_rentals && contract.customer.total_rentals > 5) {
    suggestions.push('عميل مميز - يمكن تقديم خصم ولاء');
  }

  // Duration-based suggestions
  const originalDuration = Math.ceil(
    (new Date(contract.end_date).getTime() - new Date(contract.start_date).getTime()) / 
    (1000 * 60 * 60 * 24)
  );

  if (originalDuration >= 30) {
    suggestions.push('عقد شهري - يُنصح بتقديم أسعار تنافسية للتجديد');
  }

  // Pricing suggestions
  if (contract.daily_rate < 100) {
    suggestions.push('سعر منخفض - يمكن مراجعة الأسعار للتجديد');
  }

  return suggestions;
};
