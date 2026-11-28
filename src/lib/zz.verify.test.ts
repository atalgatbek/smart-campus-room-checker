import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkRequest } from '@/lib/checkRequest';
import { isValidExplanationRequest, isValidExplanationResponse } from '@/lib/explainValidation';
import { mockExplain } from '@/lib/mockExplain';
import { INITIAL_BOOKINGS, NOW } from '@/lib/fixtures';

// TEMPORARY verification of the review findings (run once, then deleted). Each test passes if the finding is real.
const req = { roomLabel: 'Room 204 — Main Building', start: '13:00', end: '14:00', isAvailable: true, reasonCode: 'AVAILABLE' as const };
afterEach(() => vi.useRealTimers());

describe('verify review findings on version 12', () => {
  it('F1: 23:00 + 60 is AVAILABLE, but an explanation request ending at 24:00 is rejected', () => {
    expect(checkRequest('23:00', '60', NOW, false, INITIAL_BOOKINGS).reasonCode).toBe('AVAILABLE');
    expect(isValidExplanationRequest({ ...req, start: '23:00', end: '24:00' })).toBe(false);
    expect(isValidExplanationRequest({ ...req, start: '23:00', end: '' })).toBe(false);
  });
  it('F2: slow mode resolves with a timer still pending', async () => {
    vi.useFakeTimers();
    const p = mockExplain(req, 'slow');
    await vi.advanceTimersByTimeAsync(3000);
    await p;
    expect(vi.getTimerCount()).toBeGreaterThan(0);
  });
  it('F3: a 300-character text without punctuation passes the two-sentence check', () => {
    expect(isValidExplanationResponse({ explanation: 'a'.repeat(300) })).toBe(true);
  });
  it('F4: isAvailable=true with reasonCode BLOCKED is accepted and gives a contradictory text', async () => {
    const bad = { ...req, reasonCode: 'BLOCKED' as const };
    expect(isValidExplanationRequest(bad)).toBe(true);
    const res = await mockExplain(bad);
    expect(res.explanation).toMatch(/is available .* because the room is currently blocked/);
  });
  it('F6: a duration that runs past 24:00 gets the bounds message, not a duration message', () => {
    expect(checkRequest('11:00', '999999999999999999999', NOW, false, INITIAL_BOOKINGS).reason).toBe('Times must be within 00:00–24:00.');
    expect(checkRequest('23:00', '121', NOW, false, INITIAL_BOOKINGS).reasonCode).toBe('INVALID_TIME');
  });
});
