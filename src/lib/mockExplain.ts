import {
  fallbackExplanation,
  isValidExplanationRequest,
  isValidExplanationResponse,
  type ExplanationRequest,
  type ExplanationResponse,
} from '@/lib/explainValidation';

export type MockMode = 'normal' | 'slow' | 'error';

export const MOCK_TIMEOUT_MS = 3000;

function timeout(ms: number): Promise<null> {
  return new Promise((resolve) => setTimeout(resolve, ms)).then(() => null);
}

/** Thrown when the caller cancels the request (for example, the inputs changed). */
export class ExplainAbortedError extends Error {
  constructor() {
    super('Explanation request was cancelled.');
    this.name = 'AbortError';
  }
}

function whenAborted(signal?: AbortSignal): Promise<never> {
  return new Promise((_, reject) => {
    signal?.addEventListener('abort', () => reject(new ExplainAbortedError()), { once: true });
  });
}

function buildExplanation(req: ExplanationRequest): string {
  const slot = `${req.start}–${req.end}`;
  const why: Record<ExplanationRequest['reasonCode'], string> = {
    AVAILABLE: 'no confirmed booking overlaps this slot',
    OVERLAP: 'it overlaps a confirmed booking for this room',
    BLOCKED: 'the room is currently blocked',
    PAST_TIME: 'the start time is not after the current time',
    INVALID_TIME: 'the times are not a valid slot within 00:00–24:00',
    TOO_LONG: 'the slot is longer than the 120-minute maximum',
    MISSING_INPUT: 'a start time or duration is missing',
    INVALID_DURATION: 'the duration is not a whole number of minutes greater than 0',
  };
  const verdict = req.isAvailable
    ? `${req.roomLabel} is available for ${slot} because ${why[req.reasonCode]}.`
    : `${req.roomLabel} is not available for ${slot} because ${why[req.reasonCode]}.`;
  return `${verdict} This reflects the confirmed status shown above.`;
}

export async function mockExplain(
  req: ExplanationRequest,
  mode: MockMode = 'normal',
  signal?: AbortSignal
): Promise<ExplanationResponse> {
  if (signal?.aborted) {
    throw new ExplainAbortedError();
  }
  if (!isValidExplanationRequest(req)) {
    throw new Error('Invalid explanation request.');
  }
  if (mode === 'error') {
    throw new Error('Mock model failure.');
  }
  const wait = mode === 'slow' ? MOCK_TIMEOUT_MS + 500 : 200;
  const raw = await Promise.race([
    timeout(wait).then(() => ({ explanation: buildExplanation(req) })),
    timeout(MOCK_TIMEOUT_MS),
    whenAborted(signal),
  ]);
  if (raw === null || !isValidExplanationResponse(raw)) {
    return { explanation: fallbackExplanation(req.isAvailable) };
  }
  return raw;
}
