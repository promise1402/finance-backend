export type RangeType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export function getDateRange(range: RangeType, anchor: Date = new Date()): { start: Date; end: Date } {
    const start = new Date(anchor);
    const end   = new Date(anchor);

    if (range === 'daily') {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    } else if (range === 'weekly') {
        const dow = start.getDay();
        start.setDate(start.getDate() - dow); start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);     end.setHours(23, 59, 59, 999);
    } else if (range === 'monthly') {
        start.setDate(1);                       start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1);       end.setDate(0); end.setHours(23, 59, 59, 999);
    } else {
        start.setMonth(0); start.setDate(1);    start.setHours(0, 0, 0, 0);
        end.setMonth(11);  end.setDate(31);     end.setHours(23, 59, 59, 999);
    }
    return { start, end };
}