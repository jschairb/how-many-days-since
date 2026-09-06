const COLUMBUS_TIME_ZONE = 'America/New_York';

/**
 * The Columbus calendar day `date` falls on, as midnight UTC of that day.
 * Both counters and the drift guard compare days through this, so a game
 * played at noon Eastern and a visit at 11 PM Eastern land on the same day.
 */
export function columbusCalendarDay(date: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: COLUMBUS_TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return Date.UTC(value('year'), value('month') - 1, value('day'));
}

export function calcDaysSince(referenceDate: Date, now: Date): number {
  return Math.max(
    Math.round((columbusCalendarDay(now) - columbusCalendarDay(referenceDate)) / 86_400_000),
    0
  );
}

export function formatEasternTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: COLUMBUS_TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
