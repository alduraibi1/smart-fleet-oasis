// ترجمة وحدات القياس من الإنجليزية إلى العربية

export const unitTranslations: Record<string, string> = {
  piece: "قطعة",
  pieces: "قطع", 
  liter: "لتر",
  liters: "لتر",
  box: "صندوق",
  boxes: "صناديق",
  set: "طقم",
  sets: "أطقم",
  kilogram: "كيلوجرام",
  kilograms: "كيلوجرام",
  meter: "متر",
  meters: "متر",
  bottle: "زجاجة",
  bottles: "زجاجات",
  can: "علبة",
  cans: "علب"
};

/**
 * ترجمة وحدة القياس إلى العربية
 */
export const translateUnit = (unit: string): string => {
  return unitTranslations[unit.toLowerCase()] || unit;
};

/**
 * تنسيق الكمية مع وحدة القياس
 */
export const formatQuantityWithUnit = (quantity: number, unit: string): string => {
  const translatedUnit = translateUnit(unit);
  return `${quantity} ${translatedUnit}`;
};

/**
 * تنسيق الكمية مع وحدة القياس (نسخة مختصرة للجداول)
 */
export const formatQuantityShort = (quantity: number, unit: string): string => {
  const translatedUnit = translateUnit(unit);
  return `${quantity} ${translatedUnit}`;
};