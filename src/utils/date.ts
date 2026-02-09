export type RangeType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const getDayRange = (baseDate: Date = new Date()) => {
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(baseDate);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const getWeekRange = (baseDate: Date = new Date()) => {
  const start = new Date(baseDate);
  const end = new Date(baseDate);

  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday as first day

  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);

  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const getMonthRange = (baseDate: Date = new Date()) => {
  const start = new Date(baseDate);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setMonth(end.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const getYearRange = (baseDate: Date = new Date()) => {
  const start = new Date(baseDate.getFullYear(), 0, 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(baseDate.getFullYear(), 11, 31);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const getDateRange = (
  range: RangeType,
  baseDate: Date = new Date()
) => {
  switch (range) {
    case 'daily':
      return getDayRange(baseDate);
    case 'weekly':
      return getWeekRange(baseDate);
    case 'monthly':
      return getMonthRange(baseDate);
    case 'yearly':
      return getYearRange(baseDate);
    default:
      return getDayRange(baseDate);
  }
};
