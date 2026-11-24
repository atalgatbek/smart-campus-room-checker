import { canBook, type Booking, type BookingResult } from '@/lib/canBook';
import { parseHHMM } from '@/lib/time';

/** Parses the duration field. Only whole minutes are accepted, otherwise null. */
export function parseDuration(value: string): number | null {
  const text = value.trim();
  if (!/^-?\d+$/.test(text)) return null;
  return Number(text);
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
  bookings: Booking[]
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
