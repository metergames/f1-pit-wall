export function getCurrentYear() {
  return new Date().getFullYear();
}

export function getTodayIsoDate() {
  return new Date().toISOString().split('T')[0];
}

export function formatUtcDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions,
  fallback = 'TBA'
) {
  if (!dateStr) return fallback;

  const date = new Date(dateStr);
  const utcDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60000);
  return utcDate.toLocaleDateString('en-US', options);
}
