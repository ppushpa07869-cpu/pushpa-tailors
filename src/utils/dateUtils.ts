export const isDateInRange = (dateStr: string, filter: string, startDate: string, endDate: string) => {
  if (filter === 'all') return true;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return true;

  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const currentMonthPrefix = todayStr.substring(0, 7);

  switch (filter) {
    case 'today':
      return dateStr === todayStr;
    case 'yesterday':
      return dateStr === yesterdayStr;
    case 'week':
      return date >= weekAgo && date <= today;
    case 'month':
      return dateStr.startsWith(currentMonthPrefix);
    case 'custom':
      if (startDate && endDate) {
        return dateStr >= startDate && dateStr <= endDate;
      }
      if (startDate) return dateStr >= startDate;
      if (endDate) return dateStr <= endDate;
      return true;
    default:
      return true;
  }
};
