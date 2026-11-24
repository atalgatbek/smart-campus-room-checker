import { REASON_CODES, type ReasonCode } from '@/lib/canBook';

export type ExplanationRequest = {
  roomLabel: string;
  start: string;
  end: string;
  isAvailable: boolean;
  reasonCode: ReasonCode;
};

export type ExplanationResponse = { explanation: string };

export const ROOM_LABEL_MAX = 60;
export const EXPLANATION_MAX = 300;

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidExplanationRequest(value: unknown): value is ExplanationRequest {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.roomLabel === 'string' &&
    v.roomLabel.length > 0 &&
    v.roomLabel.length <= ROOM_LABEL_MAX &&
    typeof v.start === 'string' &&
    HHMM.test(v.start) &&
    typeof v.end === 'string' &&
    HHMM.test(v.end) &&
    typeof v.isAvailable === 'boolean' &&
    typeof v.reasonCode === 'string' &&
    REASON_CODES.includes(v.reasonCode as ReasonCode)
  );
}

export function isValidExplanationResponse(value: unknown): value is ExplanationResponse {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.explanation !== 'string') return false;
  const text = v.explanation;
  if (text.length === 0 || text.length > EXPLANATION_MAX) return false;
  const sentences = text.split(/[.!?]/).filter((s) => s.trim().length > 0);
  return sentences.length <= 2;
}

export function fallbackExplanation(isAvailable: boolean): string {
  return isAvailable
    ? 'The confirmed status is available. Use the result card above for booking decisions.'
    : 'The confirmed status is unavailable. Use the result card above for booking decisions.';
}
