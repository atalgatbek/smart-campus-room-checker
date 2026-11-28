import { formatMinutes } from './time';

export type Booking = { start: number; end: number };

// Single source of truth: the type and the runtime list cannot drift apart.
export const REASON_CODES = [
  'AVAILABLE',
  'OVERLAP',
  'BLOCKED',
  'PAST_TIME',
  'INVALID_TIME',
  'TOO_LONG',
  'MISSING_INPUT',
  'INVALID_DURATION',
] as const;

export type ReasonCode = (typeof REASON_CODES)[number];

export type BookingResult =
  | { status: 'invalid'; reason: string; reasonCode: ReasonCode }
  | {
      status: 'valid';
      available: boolean;
      reason: string;
      reasonCode: ReasonCode;
    };

const MINUTES_PER_DAY = 1440;

export function canBook(
  start: number,
  end: number,
  now: number,
  blocked: boolean,
  existing: readonly Booking[]
): BookingResult {
  // AC1: bounds and ordering
  if (start < 0 || start > MINUTES_PER_DAY || end < 0 || end > MINUTES_PER_DAY) {
    return {
      status: 'invalid',
      reason: 'Times must be within 00:00–24:00.',
      reasonCode: 'INVALID_TIME',
    };
  }
  if (end <= start) {
    return {
      status: 'invalid',
      reason: 'End must be after start.',
      reasonCode: 'INVALID_TIME',
    };
  }
  if (start <= now) {
    return {
      status: 'invalid',
      reason: `Start must be after current time ${formatMinutes(now)}.`,
      reasonCode: 'PAST_TIME',
    };
  }

  // AC2: duration cap (exactly 120 is allowed)
  const duration = end - start;
  if (duration > 120) {
    return {
      status: 'invalid',
      reason: 'Maximum duration is 120 minutes.',
      reasonCode: 'TOO_LONG',
    };
  }

  // AC3: blocked room is always unavailable
  if (blocked) {
    return {
      status: 'valid',
      available: false,
      reason: 'Room is currently blocked and cannot be booked.',
      reasonCode: 'BLOCKED',
    };
  }

  // AC4: reject overlap; touching endpoints do not overlap
  for (const b of existing) {
    if (start < b.end && b.start < end) {
      return {
        status: 'valid',
        available: false,
        reason: `Overlaps with existing booking ${formatMinutes(b.start)}–${formatMinutes(b.end)}.`,
        reasonCode: 'OVERLAP',
      };
    }
  }

  // AC5: unambiguous available result
  return {
    status: 'valid',
    available: true,
    reason: 'This time slot is available.',
    reasonCode: 'AVAILABLE',
  };
}
