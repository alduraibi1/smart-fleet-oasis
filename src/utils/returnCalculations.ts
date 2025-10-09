export const calculateLateFee = (
  contractEndDate: string,
  returnDate: string,
  returnTime: string,
  dailyRate: number
): number => {
  if (!contractEndDate || !returnDate || !returnTime || !dailyRate) return 0;

  const endDateTime = new Date(`${contractEndDate}T23:59:59`);
  const actualReturn = new Date(`${returnDate}T${returnTime}:00`);

  const msLate = actualReturn.getTime() - endDateTime.getTime();
  if (msLate <= 0) return 0;

  const daysLate = Math.ceil(msLate / (1000 * 60 * 60 * 24));
  return Math.max(0, daysLate * dailyRate);
};

// Calculate fuel charge based on fuel level difference
export const calculateFuelCharge = (
  startLevel: string | number,
  endLevel: string | number,
  pricePerLevel: number = 50 // Default: 50 SAR per level difference
): number => {
  const fuelLevelMap: Record<string, number> = {
    'empty': 0,
    '1/4': 25,
    '1/2': 50,
    '3/4': 75,
    'full': 100,
  };

  const start = typeof startLevel === 'string' ? (fuelLevelMap[startLevel] || 0) : startLevel;
  const end = typeof endLevel === 'string' ? (fuelLevelMap[endLevel] || 0) : endLevel;

  const difference = start - end;
  if (difference <= 0) return 0;

  // Calculate charge: each 25% costs pricePerLevel
  return Math.ceil(difference / 25) * pricePerLevel;
};

// Calculate excess mileage charge
export const calculateMileageCharge = (
  startMileage: number,
  endMileage: number,
  allowedKmPerDay: number,
  days: number,
  pricePerExcessKm: number = 0.5 // Default: 0.5 SAR per excess km
): number => {
  if (!startMileage || !endMileage || !allowedKmPerDay || !days) return 0;

  const actualKm = endMileage - startMileage;
  const allowedKm = allowedKmPerDay * days;
  const excessKm = actualKm - allowedKm;

  if (excessKm <= 0) return 0;

  return excessKm * pricePerExcessKm;
};

// Calculate contract duration in days
export const calculateContractDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Calculate total distance traveled
export const calculateDistance = (startMileage: number, endMileage: number): number => {
  return Math.max(0, endMileage - startMileage);
};
