import type { Booking } from '@/lib/canBook';

export const NOW = 540;

// Frozen so no code can change the fictional bookings by accident (AC5).
export const INITIAL_BOOKINGS: readonly Booking[] = Object.freeze([
  Object.freeze({ start: 600, end: 660 }),
]);
