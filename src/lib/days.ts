const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function calcDaysSince(referenceDate: Date, now: Date): number {
  return Math.max(
    Math.floor((now.getTime() - referenceDate.getTime()) / MS_PER_DAY),
    0
  );
}

export function formatEasternTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
