import { describe, expect, it } from 'vitest';
import { formatMinutes, parseHHMM } from '@/lib/time';

describe('parseHHMM', () => {
  it('parses valid times to minutes', () => {
    expect(parseHHMM('00:00')).toBe(0);
    expect(parseHHMM('09:30')).toBe(570);
    expect(parseHHMM('23:59')).toBe(1439);
  });

  it('returns null for empty or malformed input', () => {
    expect(parseHHMM('')).toBeNull();
    expect(parseHHMM('9:30')).toBeNull();
    expect(parseHHMM('11:00:30')).toBeNull();
    expect(parseHHMM('abc')).toBeNull();
  });

  it('returns null for out-of-range times', () => {
    expect(parseHHMM('24:00')).toBeNull();
    expect(parseHHMM('12:60')).toBeNull();
  });
});

describe('formatMinutes', () => {
  it('formats minutes as HH:MM', () => {
    expect(formatMinutes(0)).toBe('00:00');
    expect(formatMinutes(540)).toBe('09:00');
    expect(formatMinutes(1439)).toBe('23:59');
    expect(formatMinutes(1440)).toBe('24:00');
  });
});
