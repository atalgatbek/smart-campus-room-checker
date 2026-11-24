import { describe, expect, it } from 'vitest';
import type { ReasonCode } from '@/lib/canBook';
import { checkRequest } from '@/lib/checkRequest';
import { INITIAL_BOOKINGS, NOW } from '@/lib/fixtures';

// Practice #12 shared contract: the SAME eight cases are run by hand in the low-code version.
// Inputs: start time, duration (minutes), blocked flag, fictional bookings (10:00-11:00), now = 09:00.
// Outputs: availability boolean, reason code, visible message.
type Case = {
  id: string;
  start: string;
  duration: string;
  blocked: boolean;
  available: boolean;
  reasonCode: ReasonCode;
  message: string;
};

const CASES: Case[] = [
  { id: 'T1 valid free interval', start: '13:00', duration: '60', blocked: false, available: true, reasonCode: 'AVAILABLE', message: 'This time slot is available.' },
  { id: 'T2 overlap', start: '10:30', duration: '60', blocked: false, available: false, reasonCode: 'OVERLAP', message: 'Overlaps with existing booking 10:00–11:00.' },
  { id: 'T3 blocked room', start: '13:00', duration: '60', blocked: true, available: false, reasonCode: 'BLOCKED', message: 'Room is currently blocked and cannot be booked.' },
  { id: 'T4 duration 0', start: '13:00', duration: '0', blocked: false, available: false, reasonCode: 'INVALID_DURATION', message: 'Duration must be greater than 0 minutes.' },
  { id: 'T5 duration 121', start: '13:00', duration: '121', blocked: false, available: false, reasonCode: 'TOO_LONG', message: 'Maximum duration is 120 minutes.' },
  { id: 'T6 past start', start: '08:00', duration: '30', blocked: false, available: false, reasonCode: 'PAST_TIME', message: 'Start must be after current time 09:00.' },
  { id: 'T7 adjacent interval', start: '11:00', duration: '60', blocked: false, available: true, reasonCode: 'AVAILABLE', message: 'This time slot is available.' },
];

describe('Practice #12 shared test cases', () => {
  it.each(CASES)('$id', (c) => {
    const result = checkRequest(c.start, c.duration, NOW, c.blocked, INITIAL_BOOKINGS);
    const available = result.status === 'valid' && result.available;
    expect({ available, reasonCode: result.reasonCode, message: result.reason }).toEqual({
      available: c.available,
      reasonCode: c.reasonCode,
      message: c.message,
    });
  });

  it('T8 booking data unchanged after checks', () => {
    const before = structuredClone(INITIAL_BOOKINGS);
    for (const c of CASES) checkRequest(c.start, c.duration, NOW, c.blocked, INITIAL_BOOKINGS);
    expect(INITIAL_BOOKINGS).toEqual(before);
    expect(INITIAL_BOOKINGS).toEqual([{ start: 600, end: 660 }]);
  });
});
