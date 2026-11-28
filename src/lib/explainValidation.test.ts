import { describe, expect, it } from 'vitest';
import {
  fallbackExplanation,
  isValidExplanationRequest,
  isValidExplanationResponse,
  type ExplanationRequest,
} from '@/lib/explainValidation';

const validRequest: ExplanationRequest = {
  roomLabel: 'Room 204 — Main Building',
  start: '11:00',
  end: '12:00',
  isAvailable: true,
  reasonCode: 'AVAILABLE',
};

describe('isValidExplanationRequest', () => {
  it('accepts a valid request', () => {
    expect(isValidExplanationRequest(validRequest)).toBe(true);
  });

  it('rejects empty, malformed or over-long room labels', () => {
    expect(isValidExplanationRequest({ ...validRequest, roomLabel: '' })).toBe(false);
    expect(isValidExplanationRequest({ ...validRequest, roomLabel: 'a'.repeat(61) })).toBe(false);
  });

  it('accepts a room label at the 60-character limit', () => {
    expect(isValidExplanationRequest({ ...validRequest, roomLabel: 'a'.repeat(60) })).toBe(true);
  });

  it('rejects malformed times', () => {
    expect(isValidExplanationRequest({ ...validRequest, start: '9:00' })).toBe(false);
    expect(isValidExplanationRequest({ ...validRequest, start: '11:00:30' })).toBe(false);
    expect(isValidExplanationRequest({ ...validRequest, start: '' })).toBe(false);
  });

  it('rejects impossible times (regression: 24:00 as a start, 24:30 and 99:99)', () => {
    expect(isValidExplanationRequest({ ...validRequest, start: '24:00' })).toBe(false);
    expect(isValidExplanationRequest({ ...validRequest, start: '99:99' })).toBe(false);
    expect(isValidExplanationRequest({ ...validRequest, end: '24:30' })).toBe(false);
    expect(isValidExplanationRequest({ ...validRequest, end: '99:99' })).toBe(false);
  });

  it('rejects unknown reason codes and wrong types', () => {
    expect(isValidExplanationRequest({ ...validRequest, reasonCode: 'HACKED' })).toBe(false);
    expect(isValidExplanationRequest({ ...validRequest, isAvailable: 'yes' })).toBe(false);
    expect(isValidExplanationRequest(null)).toBe(false);
    expect(isValidExplanationRequest('nope')).toBe(false);
  });
});

describe('isValidExplanationResponse', () => {
  it('accepts a valid explanation', () => {
    expect(isValidExplanationResponse({ explanation: 'Room 204 is available for 11:00–12:00. This reflects the confirmed status shown above.' })).toBe(true);
  });

  it('rejects empty, over-long or non-string explanations', () => {
    expect(isValidExplanationResponse({ explanation: '' })).toBe(false);
    expect(isValidExplanationResponse({ explanation: 'a'.repeat(301) })).toBe(false);
    expect(isValidExplanationResponse({ explanation: 42 })).toBe(false);
    expect(isValidExplanationResponse(null)).toBe(false);
  });

  it('rejects more than two sentences', () => {
    expect(isValidExplanationResponse({ explanation: 'One. Two. Three.' })).toBe(false);
  });
});

describe('fallbackExplanation', () => {
  it('matches the confirmed status without contradicting it', () => {
    expect(fallbackExplanation(true)).toContain('available');
    expect(fallbackExplanation(false)).toContain('unavailable');
  });
});
