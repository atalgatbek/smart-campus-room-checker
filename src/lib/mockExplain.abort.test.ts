import { describe, expect, it } from 'vitest';
import type { ExplanationRequest } from '@/lib/explainValidation';
import { ExplainAbortedError, mockExplain } from '@/lib/mockExplain';

// Risk R01 (Assignment #05): an explanation for old inputs appeared after the
// user changed the times. Cancelling the request must stop the answer.
const request: ExplanationRequest = {
  roomLabel: 'Room 204 — Main Building',
  start: '11:00',
  end: '12:00',
  isAvailable: true,
  reasonCode: 'AVAILABLE',
};

describe('mockExplain cancellation', () => {
  it('rejects with AbortError when cancelled during the wait', async () => {
    const controller = new AbortController();
    const pending = mockExplain(request, 'normal', controller.signal);
    setTimeout(() => controller.abort(), 50);
    await expect(pending).rejects.toBeInstanceOf(ExplainAbortedError);
  });

  it('rejects at once when the signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(mockExplain(request, 'normal', controller.signal)).rejects.toThrow(
      'Explanation request was cancelled.'
    );
  });

  it('still returns the explanation when not cancelled', async () => {
    const controller = new AbortController();
    const res = await mockExplain(request, 'normal', controller.signal);
    expect(res.explanation).toContain('11:00–12:00');
  });
});
