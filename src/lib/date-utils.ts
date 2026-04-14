/**
 * Consistent date utilities for PomoPulp
 * Standardizes the YYYY-MM-DD format based on local timezone for both stores and UI.
 */

export function getLocalDateKey(date: Date = new Date()): string {
  // en-CA is used because it consistently returns YYYY-MM-DD
  return date.toLocaleDateString('en-CA');
}

export function formatTimezoneOffset(date: Date = new Date()): string {
  const offsetMinutes = -date.getTimezoneOffset();
  const hours = Math.floor(Math.abs(offsetMinutes) / 60);
  const mins = Math.abs(offsetMinutes) % 60;
  const sign = offsetMinutes >= 0 ? "+" : "-";
  return `${sign}${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
