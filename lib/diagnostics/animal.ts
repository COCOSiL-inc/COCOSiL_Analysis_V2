import { ANIMAL_60_CHARACTERS } from '@/lib/data/animal-characters';

export interface AnimalResult {
  animalType: string;
  animalCharacter: string;
  color: string;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysInMonth(year: number, month: number): number {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month === 2 && isLeapYear(year) ? 29 : days[month - 1];
}

function dateToExcelSerial(year: number, month: number, day: number): number {
  let totalDays = 0;
  for (let y = 1900; y < year; y++) {
    totalDays += isLeapYear(y) ? 366 : 365;
  }
  for (let m = 1; m < month; m++) {
    totalDays += getDaysInMonth(year, m);
  }
  totalDays += day;
  // Excelの1900年うるう年バグ補正
  if (totalDays >= 60) totalDays += 1;
  return totalDays;
}

export function calculate60Animal(year: number, month: number, day: number): AnimalResult {
  const serial = dateToExcelSerial(year, month, day);
  const animalNumber = ((serial + 8) % 60) + 1;
  const entry = ANIMAL_60_CHARACTERS[animalNumber];
  if (!entry) {
    throw new Error(`動物番号 ${animalNumber} が見つかりません (serial: ${serial})`);
  }
  return {
    animalType: entry.baseAnimal,
    animalCharacter: entry.character,
    color: entry.color,
  };
}
