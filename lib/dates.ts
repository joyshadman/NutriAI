/**
 * Calendar dates for meals.
 *
 * A meal stores the user's local date at write time. It is computed from the
 * eaten time and the user's IANA timezone, so a meal eaten at 23:30 in Tokyo
 * belongs to the next day even though the server clock says otherwise.
 */

export class InvalidTimezoneError extends Error {
  constructor(public readonly timezone: string) {
    super(`"${timezone}" is not a valid IANA timezone name.`);
    this.name = 'InvalidTimezoneError';
  }
}

/**
 * Returns the calendar date of `eatenAt` in `timezone`, as `YYYY-MM-DD`, the
 * shape a Postgres `date` column reads and writes.
 */
export function computeLocalDate(eatenAt: Date, timezone: string): string {
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    throw new InvalidTimezoneError(timezone);
  }

  // Read the parts rather than the formatted string: locales and ICU versions
  // disagree on separators, but the parts are stable.
  const parts = formatter.formatToParts(eatenAt);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((candidate) => candidate.type === type)?.value;

  const year = part('year');
  const month = part('month');
  const day = part('day');

  if (!year || !month || !day) {
    throw new InvalidTimezoneError(timezone);
  }

  return `${year}-${month}-${day}`;
}
