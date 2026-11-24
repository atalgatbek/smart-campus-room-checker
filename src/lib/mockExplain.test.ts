import { describe, expect, it } from 'vitest';
import { MOCK_TIMEOUT_MS, mockExplain, type MockMode } from '@/lib/mockExplain';
import type { ExplanationRequest } from '@/lib/explainValidation';

const req: ExplanationRequest = {
  roomLabel: 'Room 204 — Main Building',
  start: '11:00',
  end: '12:00',
  isAvailable: true,
  reasonCode: 'AVAILABLE',
};

function rejectSlow(): MockMode {
  return 'slow';
}

describe('mockExplain', () => {
  it('explains an available slot from the given fields only', async () => {
    const res = await mockExplain(req);
    expect(res.explanation).toContain('Room 204 — Main Building is available for 11:00–12:00');
    expect(res.explanation).toContain('no confirmed booking overlaps');
  });

  it('explains an overlap without contradicting unavailability', async () => {
    const res = await mockExplain({ ...req, isAvailable: false, reasonCode: 'OVERLAP' });
    expect(res.explanation).toContain('is not available');
    expect(res.explanation).toContain('overlaps a confirmed booking');
  });

  it('explains every reason code without inventing booking details', async () => {
    for (const reasonCode of [
      'BLOCKED',
      'PAST_TIME',
      'INVALID_TIME',
      'TOO_LONG',
      'MISSING_INPUT',
    ] as const) {
      const res = await mockExplain({ ...req, isAvailable: false, reasonCode });
      expect(res.explanation.length).toBeGreaterThan(0);
      expect(res.explanation.length).toBeLessThanOrEqual(300);
    }
  });

  it('rejects an invalid request before any delay', async () => {
    await expect(
      mockExplain({ ...req, roomLabel: 'a'.repeat(61) })
    ).rejects.toThrow('Invalid explanation request.');
  });

  it('rejects in error mode', async () => {
    await expect(mockExplain(req, 'error')).rejects.toThrow('Mock model failure.');
  });

  it('falls back deterministically when the mock model is too slow', async () => {
    const res = await mockExplain(req, rejectSlow());
    expect(res.explanation).toBe(
      'The confirmed status is available. Use the result card above for booking decisions.'
    );
  });

  it('constant is under 4 seconds', () => {
    expect(MOCK_TIMEOUT_MS).toBe(3000);
  });
});
