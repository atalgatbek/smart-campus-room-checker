import { canBook, type Booking, type BookingResult } from '@/lib/canBook';
import { formatMinutes, parseHHMM } from '@/lib/time';

/** Parses the duration field. Only whole minutes are accepted, otherwise null. */
export function parseDuration(value: string): number | null {
  const text = value.trim();
  if (!/^-?\d+$/.test(text)) return null;
  return Number(text);
}

/**
 * End time shown under the duration field ("Ends at HH:MM") and sent to the explanation.
 * Empty when the input is invalid or the slot would end after 24:00.
 * A slot may end exactly at 24:00 (the rules allow end = 1440).
 */
export function endTimeOf(startTime: string, durationText: string): string {
  const start = parseHHMM(startTime);
  const duration = parseDuration(durationText);
  if (start === null || duration === null || duration <= 0) return '';
  const end = start + duration;
  return end <= 1440 ? formatMinutes(end) : '';
}

/**
 * Validation layer: turns the raw form input (start time + duration) into minutes,
 * then hands it to the booking rules in canBook.ts.
 */
export function checkRequest(
  startTime: string,
  durationText: string,
  now: number,
  blocked: boolean,
  bookings: readonly Booking[]
): BookingResult {
  const start = parseHHMM(startTime);
  const durationMissing = durationText.trim() === '';
  if (start === null && durationMissing) {
    return {
      status: 'invalid',
      reason: 'Start time and duration are required.',
      reasonCode: 'MISSING_INPUT',
    };
  }
  if (start === null) {
    return {
      status: 'invalid',
      reason: 'Start time is required.',
      reasonCode: 'MISSING_INPUT',
    };
  }
  if (durationMissing) {
    return {
      status: 'invalid',
      reason: 'Duration is required.',
      reasonCode: 'MISSING_INPUT',
    };
  }
  const duration = parseDuration(durationText);
  if (duration === null) {
    return {
      status: 'invalid',
      reason: 'Duration must be a whole number of minutes.',
      reasonCode: 'INVALID_DURATION',
    };
  }
  if (duration <= 0) {
    return {
      status: 'invalid',
      reason: 'Duration must be greater than 0 minutes.',
      reasonCode: 'INVALID_DURATION',
    };
  }
  return canBook(start, start + duration, now, blocked, bookings);
}
