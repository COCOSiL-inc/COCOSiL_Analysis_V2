import { getDestinyNumberFromDatabase, hasDestinyNumberInDatabase } from '@/lib/data/destiny-number-database';

const STAR_RANGES: Array<{ name: string; min: number; max: number }> = [
  { name: '土星人', min: 1, max: 10 },
  { name: '金星人', min: 11, max: 20 },
  { name: '火星人', min: 21, max: 30 },
  { name: '天王星人', min: 31, max: 40 },
  { name: '木星人', min: 41, max: 50 },
  { name: '水星人', min: 51, max: 60 },
];

function getStarType(starNumber: number): string {
  const star = STAR_RANGES.find((s) => starNumber >= s.min && starNumber <= s.max);
  if (!star) throw new Error(`無効な星番号: ${starNumber}`);
  return star.name;
}

export function calculateSixStar(year: number, month: number, day: number): string {
  if (!hasDestinyNumberInDatabase(year, month)) {
    throw new Error(`運命数データベースに ${year}年${month}月 のデータがありません`);
  }
  const destinyNumber = getDestinyNumberFromDatabase(year, month);
  let starNumber = destinyNumber - 1 + day;
  if (starNumber > 60) starNumber -= 60;
  const starType = getStarType(starNumber);
  const sign = year % 2 === 0 ? '+' : '-';
  return `${starType}${sign}`;
}
