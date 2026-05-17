import { describe, it, expect } from 'vitest';
import { calculate60Animal } from '../animal';

describe('calculate60Animal', () => {
  it.each([
    [1971, 6, 28, '落ち着きのあるペガサス'],
    [1985, 4, 22, '優雅なペガサス'],
    [1967, 10, 11, 'サービス精神旺盛な子守熊'],
    [1964, 1, 12, '感情的なライオン'],
    [2008, 1, 5, '大器晩成のたぬき'],
    [1990, 5, 15, '強い意志をもったこじか'],
    [2000, 12, 31, '慈悲深い虎'],
    [1975, 8, 10, '穏やかな狼'],
    [1980, 3, 20, 'チャレンジ精神旺盛なひつじ'],
    [1995, 11, 7, '夢とロマンの子守熊'],
  ])('%i-%i-%i → %s', (year, month, day, expectedCharacter) => {
    const result = calculate60Animal(year, month, day);
    expect(result.animalCharacter).toBe(expectedCharacter);
  });

  it('returns animalType and color', () => {
    const result = calculate60Animal(1971, 6, 28);
    expect(result.animalType).toBe('ペガサス');
    expect(typeof result.color).toBe('string');
  });
});
