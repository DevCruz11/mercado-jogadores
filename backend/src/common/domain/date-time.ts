const BRASILIA_INPUT_FORMAT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})-03:00$/;
const BRASILIA_OFFSET_HOURS = 3;
const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
export const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;

export function parseBrasiliaDateTime(text: string): Date | null {
  const match = BRASILIA_INPUT_FORMAT.exec(text);
  if (!match) {
    return null;
  }
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  if (month < 1 || month > 12 || hour > 23 || minute > 59) {
    return null;
  }
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > daysInMonth) {
    return null;
  }
  return new Date(Date.UTC(year, month - 1, day, hour + BRASILIA_OFFSET_HOURS, minute));
}

export function formatBrasiliaDateTime(date: Date): string {
  const local = new Date(date.getTime() - BRASILIA_OFFSET_HOURS * MILLISECONDS_PER_HOUR);
  const pad = (value: number) => String(value).padStart(2, '0');
  const datePart = `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}`;
  const timePart = `${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}:${pad(local.getUTCSeconds())}`;
  return `${datePart}T${timePart}-03:00`;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MILLISECONDS_PER_DAY);
}
