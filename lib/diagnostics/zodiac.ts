const ZODIAC_DATA = [
  { name: '山羊座', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { name: '水瓶座', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { name: '魚座', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
  { name: '牡羊座', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { name: '牡牛座', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { name: '双子座', startMonth: 5, startDay: 21, endMonth: 6, endDay: 21 },
  { name: '蟹座', startMonth: 6, startDay: 22, endMonth: 7, endDay: 22 },
  { name: '獅子座', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { name: '乙女座', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { name: '天秤座', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
  { name: '蠍座', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  { name: '射手座', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
] as const;

export function calculateZodiacSign(month: number, day: number): string {
  for (const zodiac of ZODIAC_DATA) {
    if (zodiac.startMonth > zodiac.endMonth) {
      // 年をまたぐ星座（山羊座）
      if (
        (month === zodiac.startMonth && day >= zodiac.startDay) ||
        (month === zodiac.endMonth && day <= zodiac.endDay)
      ) {
        return zodiac.name;
      }
    } else {
      if (
        (month === zodiac.startMonth && day >= zodiac.startDay) ||
        (month === zodiac.endMonth && day <= zodiac.endDay) ||
        (month > zodiac.startMonth && month < zodiac.endMonth)
      ) {
        return zodiac.name;
      }
    }
  }
  return '山羊座';
}
