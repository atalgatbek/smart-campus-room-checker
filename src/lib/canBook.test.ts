import { describe, expect, it } from 'vitest';
import { canBook, type Booking } from '@/lib/canBook';

const NOW = 540;
const existing: Booking[] = [{ start: 600, end: 660 }];

describe('AC1: time must be valid and start strictly after now', () => {
  it('rejects a start time in the past', () => {
    expect(canBook(480, 540, NOW, false, existing)).toEqual({
      status: 'invalid',
      reason: 'Start must be after current time 09:00.',
      reasonCode: 'PAST_TIME',
    });
  });

  it('rejects a start time equal to now (09:00)', () => {
    expect(canBook(540, 600, NOW, false, existing)).toEqual({
      status: 'invalid',
      reason: 'Start must be after current time 09:00.',
      reasonCode: 'PAST_TIME',
    });
  });

  it('rejects an end time before the start time', () => {
    expect(canBook(720, 660, NOW, false, existing)).toEqual({
      status: 'invalid',
      reason: 'End must be after start.',
      reasonCode: 'INVALID_TIME',
    });
  });
});

describe('AC2: maximum duration is 120 minutes', () => {
  it('rejects 121 minutes', () => {
    expect(canBook(720, 841, NOW, false, existing)).toEqual({
      status: 'invalid',
      reason: 'Maximum duration is 120 minutes.',
      reasonCode: 'TOO_LONG',
    });
  });

  it('allows exactly 120 minutes', () => {
    expect(canBook(720, 840, NOW, false, existing)).toEqual({
      status: 'valid',
      available: true,
      reason: 'This time slot is available.',
      reasonCode: 'AVAILABLE',
    });
  });
});

describe('AC3: blocked room is always unavailable', () => {
  it('returns unavailable when the room is blocked', () => {
    expect(canBook(720, 780, NOW, true, existing)).toEqual({
      status: 'valid',
      available: false,
      reason: 'Room is currently blocked and cannot be booked.',
      reasonCode: 'BLOCKED',
    });
  });
});

describe('AC4: overlapping bookings are rejected, touching endpoints are allowed', () => {
  it('rejects a slot that overlaps an existing booking', () => {
    expect(canBook(630, 690, NOW, false, existing)).toEqual({
      status: 'valid',
      available: false,
      reason: 'Overlaps with existing booking 10:00–11:00.',
      reasonCode: 'OVERLAP',
    });
  });

  it('allows a slot that starts exactly when an existing booking ends', () => {
    expect(canBook(660, 720, NOW, false, existing)).toEqual({
      status: 'valid',
      available: true,
      reason: 'This time slot is available.',
      reasonCode: 'AVAILABLE',
    });
  });

  it('allows a slot that ends exactly when an existing booking starts', () => {
    expect(canBook(570, 600, NOW, false, existing)).toEqual({
      status: 'valid',
      available: true,
      reason: 'This time slot is available.',
      reasonCode: 'AVAILABLE',
    });
  });
});

describe('AC5: booking data is never changed', () => {
  it('leaves the existing bookings unchanged after checks', () => {
    const snapshot = structuredClone(existing);
    canBook(630, 690, NOW, false, existing);
    canBook(660, 720, NOW, false, existing);
    canBook(720, 780, NOW, true, existing);
    expect(existing).toEqual(snapshot);
  });
});

describe('bounds message', () => {
  it('rejects an end time after 24:00', () => {
    expect(canBook(720, 1441, NOW, false, existing)).toEqual({
      status: 'invalid',
      reason: 'Times must be within 00:00–24:00.',
      reasonCode: 'INVALID_TIME',
    });
  });

  it('rejects a negative start time', () => {
    expect(canBook(-1, 600, NOW, false, existing)).toEqual({
      status: 'invalid',
      reason: 'Times must be within 00:00–24:00.',
      reasonCode: 'INVALID_TIME',
    });
  });
});

describe('blocked and overlap together', () => {
  it('reports blocked, not overlap, when both apply', () => {
    expect(canBook(630, 690, NOW, true, existing)).toEqual({
      status: 'valid',
      available: false,
      reason: 'Room is currently blocked and cannot be booked.',
      reasonCode: 'BLOCKED',
    });
  });
});
