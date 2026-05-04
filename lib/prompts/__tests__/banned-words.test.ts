import { describe, expect, test } from 'vitest'
import { findBannedWords } from '@/lib/constitution/banned-words'
import { WELCOME_SYSTEM_PROMPT } from '@/lib/prompts/onboarding'
import {
  CONTRADICTION_PROMPT_WITH,
  CONTRADICTION_PROMPT_WITHOUT,
  buildWithContradictionInsight,
  buildWithoutContradictionInsight,
} from '@/lib/prompts/contradiction-handling'

describe('lib/prompts: 禁止語彙の不混入（Constitution as Code）', () => {
  test('onboarding: WELCOME_SYSTEM_PROMPT に禁止語彙が含まれない', () => {
    expect(findBannedWords(WELCOME_SYSTEM_PROMPT)).toEqual([])
  })

  test('contradiction-handling: CONTRADICTION_PROMPT_WITH に禁止語彙が含まれない', () => {
    expect(findBannedWords(CONTRADICTION_PROMPT_WITH)).toEqual([])
  })

  test('contradiction-handling: CONTRADICTION_PROMPT_WITHOUT に禁止語彙が含まれない', () => {
    expect(findBannedWords(CONTRADICTION_PROMPT_WITHOUT)).toEqual([])
  })

  test('contradiction-handling: ビルド済みプロンプト（テーマ展開後）にも禁止語彙が含まれない', () => {
    const sample1 = buildWithoutContradictionInsight(['内向性', '繊細さ', '思慮深さ'])
    const sample2 = buildWithContradictionInsight('外向的なエネルギー', '内向的な深さ')
    expect(findBannedWords(sample1)).toEqual([])
    expect(findBannedWords(sample2)).toEqual([])
  })
})

describe('lib/prompts: 必須キーワード（共感フェーズの語感）', () => {
  test('onboarding: 共感フェーズに対応する語が含まれる', () => {
    const empathyKeywords = ['気持ち', '聞かせて', '受け取', '感じ']
    expect(empathyKeywords.some((k) => WELCOME_SYSTEM_PROMPT.includes(k))).toBe(true)
  })
})
