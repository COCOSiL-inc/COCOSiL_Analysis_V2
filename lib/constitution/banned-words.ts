// COCOSiL Constitution: 禁止語彙の単一の真実
// 文書側: docs/input/concepts/language-design-v1.md / AGENTS.md §6 / cocosil-domain skill
// ドリフト時はこのファイルを正とする（lib/constitution/__tests__/drift.test.ts で整合性検証）

export const BANNED_WORDS = [
  '占い',
  '占い師',
  '鑑定',
  '運勢',
  '占星術',
  '当たる',
  '当たった',
  '霊感',
  '霊視',
] as const

export type BannedWord = (typeof BANNED_WORDS)[number]

export function findBannedWords(text: string): BannedWord[] {
  return BANNED_WORDS.filter((word) => text.includes(word))
}

export function containsBannedWord(text: string): boolean {
  return findBannedWords(text).length > 0
}
