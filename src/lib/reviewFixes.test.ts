import { describe, expect, it } from 'vitest';
import { canBook, type Booking } from '@/lib/canBook';
import { checkRequest, endTimeOf } from '@/lib/checkRequest';
import { isValidExplanationRequest } from '@/lib/explainValidation';
import { mockExplain } from '@/lib/mockExplain';
import { INITIAL_BOOKINGS, NOW } from '@/lib/fixtures';

// Regression tests for the confirmed findings of the Assignment #06 code review.

describe('R1: a slot that ends exactly at 24:00', () => {
  it('is available by the rules', () => {
    const r = checkRequest('23:00', '60', NOW, false, INITIAL_BOOKINGS);
    expect(r.status === 'valid' && r.available).toBe(true);
  });

  it('shows "Ends at 24:00" instead of an empty end time', () => {
    expect(endTimeOf('23:00', '60')).toBe('24:00');
    expect(endTimeOf('13:00', '60')).toBe('14:00');
  });

  it('has no end time when the input is invalid or ends after 24:00', () => {
    expect(endTimeOf('23:30', '60')).toBe('');
    expect(endTimeOf('13:00', '0')).toBe('');
    expect(endTimeOf('13:00', 'abc')).toBe('');
    expect(endTimeOf('', '60')).toBe('');
  });

  it('accepts 24:00 as the end of an explanation request, but not as a start', () => {
    const base = { roomLabel: 'Room 204 — Main Building', isAvailable: true, reasonCode: 'AVAILABLE' };
    expect(isValidExplanationRequest({ ...base, start: '23:00', end: '24:00' })).toBe(true);
    expect(isValidExplanationRequest({ ...base, start: '24:00', end: '24:00' })).toBe(false);
    expect(isValidExplanationRequest({ ...base, start: '23:00', end: '24:30' })).toBe(false);
  });

  it('gets a real explanation, not the fallback', async () => {
    const res = await mockExplain({
      roomLabel: 'Room 204 — Main Building',
      start: '23:00',
      end: '24:00',
      isAvailable: true,
      reasonCode: 'AVAILABLE',
    });
    expect(res.explanation).toContain('23:00–24:00');
  });
});

describe('R3: the explanation request must agree with the confirmed result', () => {
  const base = { roomLabel: 'Room 204 — Main Building', start: '13:00', end: '14:00' };

  it('rejects a verdict that contradicts its reason code', () => {
    expect(isValidExplanationRequest({ ...base, isAvailable: true, reasonCode: 'BLOCKED' })).toBe(false);
    expect(isValidExplanationRequest({ ...base, isAvailable: false, reasonCode: 'AVAILABLE' })).toBe(false);
  });

  it('still accepts the consistent pairs the page sends', () => {
    expect(isValidExplanationRequest({ ...base, isAvailable: true, reasonCode: 'AVAILABLE' })).toBe(true);
    expect(isValidExplanationRequest({ ...base, isAvailable: false, reasonCode: 'OVERLAP' })).toBe(true);
  });

  it('never produces a self-contradicting explanation', async () => {
    await expect(
      mockExplain({ ...base, roomLabel: 'Room 204 — Main Building', isAvailable: true, reasonCode: 'BLOCKED' })
    ).rejects.toThrow('Invalid explanation request.');
  });
});

describe('R2: the fictional bookings cannot be changed', () => {
  it('the list and each booking are frozen', () => {
    expect(Object.isFrozen(INITIAL_BOOKINGS)).toBe(true);
    expect(INITIAL_BOOKINGS.every((b) => Object.isFrozen(b))).toBe(true);
  });

  it('a write attempt throws and leaves the data unchanged', () => {
    expect(() => (INITIAL_BOOKINGS as Booking[]).push({ start: 0, end: 30 })).toThrow();
    expect(() => {
      (INITIAL_BOOKINGS[0] as Booking).start = 0;
    }).toThrow();
    expect(INITIAL_BOOKINGS).toEqual([{ start: 600, end: 660 }]);
  });

  it('repeated checks give the same answer and do not change the data', () => {
    const first = canBook(780, 840, NOW, false, INITIAL_BOOKINGS);
    for (let i = 0; i < 20; i++) canBook(630, 690, NOW, false, INITIAL_BOOKINGS);
    expect(canBook(780, 840, NOW, false, INITIAL_BOOKINGS)).toEqual(first);
    expect(INITIAL_BOOKINGS).toEqual([{ start: 600, end: 660 }]);
  });
});
