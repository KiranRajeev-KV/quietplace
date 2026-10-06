export function formatDate(value: string, includeYear = true) {
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: includeYear ? 'numeric' : undefined,
    timeZone: 'UTC',
  }).format(new Date(value));
}
