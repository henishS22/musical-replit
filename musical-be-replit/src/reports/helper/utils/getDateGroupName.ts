import { format as formatDate } from 'date-fns';

export type GroupByDate = 'day' | 'week' | 'month' | 'year';

export default function getDateGroupName(
  date: Date,
  groupBy: GroupByDate,
): string {
  const format = {
    day: 'yyyy-MM-dd',
    week: 'yyyy-ww',
    month: 'yyyy-MM',
    year: 'yyyy',
  }[groupBy];

  return formatDate(date, format);
}
