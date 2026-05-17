import { describe, it, expect } from 'vitest';
import { calculateZodiacSign } from '../zodiac';

describe('calculateZodiacSign', () => {
  it.each([
    [3, 21, '牡羊座'],
    [4, 19, '牡羊座'],
    [4, 20, '牡牛座'],
    [5, 20, '牡牛座'],
    [5, 21, '双子座'],
    [6, 21, '双子座'],
    [6, 22, '蟹座'],
    [7, 22, '蟹座'],
    [7, 23, '獅子座'],
    [8, 22, '獅子座'],
    [8, 23, '乙女座'],
    [9, 22, '乙女座'],
    [9, 23, '天秤座'],
    [10, 22, '天秤座'],
    [10, 23, '蠍座'],
    [11, 21, '蠍座'],
    [11, 22, '射手座'],
    [12, 21, '射手座'],
    [12, 22, '山羊座'],
    [1, 19, '山羊座'],
    [1, 20, '水瓶座'],
    [2, 18, '水瓶座'],
    [2, 19, '魚座'],
    [3, 20, '魚座'],
  ])('%i/%i → %s', (month, day, expected) => {
    expect(calculateZodiacSign(month, day)).toBe(expected);
  });

  it('reference case: 1971-6-28 → 蟹座', () => {
    expect(calculateZodiacSign(6, 28)).toBe('蟹座');
  });

  it('reference case: 1985-4-22 → 牡牛座', () => {
    expect(calculateZodiacSign(4, 22)).toBe('牡牛座');
  });
});
