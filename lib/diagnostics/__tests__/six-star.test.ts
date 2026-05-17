import { describe, it, expect } from 'vitest';
import { calculateSixStar } from '../six-star';

describe('calculateSixStar', () => {
  // Expected values computed from the reference algorithm (precision-calculator.ts)
  it.each([
    [1971, 6, 28, '火星人-'],
    [1985, 4, 22, '火星人-'],
    [1967, 10, 11, '木星人-'],
    [1964, 1, 12, '水星人+'],
    [2008, 1, 5, '木星人+'],
    [1990, 5, 15, '金星人+'],
    [2000, 12, 31, '水星人+'],
    [1975, 8, 10, '火星人-'],
    [1980, 3, 20, '火星人+'],
    [1995, 11, 7, '天王星人-'],
  ])('%i-%i-%i → %s', (year, month, day, expected) => {
    expect(calculateSixStar(year, month, day)).toBe(expected);
  });

  it('even year gives + sign', () => {
    const result = calculateSixStar(2000, 1, 1);
    expect(result.endsWith('+')).toBe(true);
  });

  it('odd year gives - sign', () => {
    const result = calculateSixStar(2001, 1, 1);
    expect(result.endsWith('-')).toBe(true);
  });

  it('throws for year before 1930', () => {
    expect(() => calculateSixStar(1929, 1, 1)).toThrow();
  });

  it('throws for year after 2030', () => {
    expect(() => calculateSixStar(2031, 1, 1)).toThrow();
  });
});
