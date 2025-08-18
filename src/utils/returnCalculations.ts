
export const calculateLateFee = (
  contractEndDate: string, // e.g. '2025-08-18'
  returnDate: string,      // from input type="date"
  returnTime: string,      // from input type="time" 'HH:MM'
  dailyRate: number
): number => {
  if (!contractEndDate || !returnDate || !returnTime || !dailyRate) return 0;

  // Treat contract end at the end of the day if no time provided
  const endDateTime = new Date(`${contractEndDate}T23:59:59`);
  const actualReturn = new Date(`${returnDate}T${returnTime}:00`);

  const msLate = actualReturn.getTime() - endDateTime.getTime();
  if (msLate <= 0) return 0;

  const daysLate = Math.ceil(msLate / (1000 * 60 * 60 * 24));
  return Math.max(0, daysLate * dailyRate);
};
