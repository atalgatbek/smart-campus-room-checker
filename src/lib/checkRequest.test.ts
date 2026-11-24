import { describe, expect, it } from 'vitest';
import { checkRequest, parseDuration } from '@/lib/checkRequest';
import { INITIAL_BOOKINGS, NOW } from '@/lib/fixtures';

// Practice #12 contract: the form sends a start time and a duration in minutes.
describe('checkRequest (start time + duration)', () => {
  it('reports a missing start time', () => {
    expect(checkRequest('', '60', NOW, false, INITIAL_BOOKINGS)).toEqual({
      status: 'invalid',
      reason: 'Start time is required.',
      reasonCode: 'MISSING_INPUT',
    });
  });

  it('reports a missing duration', () => {
    expect(checkRequest('11:00', '', NOW, false, INITIAL_BOOKINGS)).toEqual({
      status: 'invalid',
      reason: 'Duration is required.',
      reasonCode: 'MISSING_INPUT',
    });
  });

  it('reports both inputs missing', () => {
    expect(checkRequest('', ' ', NOW, false, INITIAL_BOOKINGS)).toEqual({
      status: 'invalid',
      reason: 'Start time and duration are required.',
      reasonCode: 'MISSING_INPUT',
    });
  });

  it('rejects a duration that is not a whole number', () => {
    for (const bad of ['abc', '1.5', '60m', '1e2']) {
      expect(checkRequest('11:00', bad, NOW, false, INITIAL_BOOKINGS)).toEqual({
        status: 'invalid',
        reason: 'Duration must be a whole number of minutes.',
        reasonCode: 'INVALID_DURATION',
      });
    }
  });

  it('rejects a negative duration', () => {
    expect(checkRequest('11:00', '-5', NOW, false, INITIAL_BOOKINGS)).toEqual({
      status: 'invalid',
      reason: 'Duration must be greater than 0 minutes.',
      reasonCode: 'INVALID_DURATION',
    });
  });

  it('allows exactly 120 minutes', () => {
    expect(checkRequest('12:00', '120', NOW, false, INITIAL_BOOKINGS)).toEqual({
      status: 'valid',
      available: true,
      reason: 'This time slot is available.',
      reasonCode: 'AVAILABLE',
    });
  });

  it('rejects a slot that runs past midnight', () => {
    expect(checkRequest('23:30', '60', NOW, false, INITIAL_BOOKINGS)).toEqual({
      status: 'invalid',
      reason: 'Times must be within 00:00–24:00.',
      reasonCode: 'INVALID_TIME',
    });
  });

  it('allows a slot that ends exactly at midnight', () => {
    expect(checkRequest('23:00', '60', NOW, false, INITIAL_BOOKINGS).reasonCode).toBe('AVAILABLE');
  });
});

describe('parseDuration', () => {
  it('parses whole minutes and rejects everything else', () => {
    expect(parseDuration('60')).toBe(60);
    expect(parseDuration(' 15 ')).toBe(15);
    expect(parseDuration('0')).toBe(0);
    expect(parseDuration('-5')).toBe(-5);
    expect(parseDuration('1.5')).toBeNull();
    expect(parseDuration('')).toBeNull();
  });
});
