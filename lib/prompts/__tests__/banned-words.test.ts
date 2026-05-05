import { describe, expect, test } from 'vitest'
import { findBannedWords } from '@/lib/constitution/banned-words'
import { WELCOME_SYSTEM_PROMPT } from '@/lib/prompts/onboarding'
import {
  CONTRADICTION_PROMPT_WITH,
  CONTRADICTION_PROMPT_WITHOUT,
  buildWithContradictionInsight,
  buildWithoutContradictionInsight,
} from '@/lib/prompts/contradiction-handling'
import {
  REASSURANCE_MAIN_TEXT,
  REASSURANCE_SUB_TEXT,
  REASSURANCE_RETURN_TEXT,
  REASSURANCE_CTA_LABEL,
  REASSURANCE_CTA_LABEL_RETURN,
} from '@/lib/prompts/reassurance'
import { CHAT_PHASE1_SYSTEM_PROMPT } from '@/lib/prompts/chat-phase1'
import { CHAT_PHASE2_SYSTEM_PROMPT, buildChatPhase2Prompt } from '@/lib/prompts/chat-phase2'

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

describe('lib/prompts: reassurance — 禁止語彙チェック（F3.2 安心フェーズ）', () => {
  test('REASSURANCE_MAIN_TEXT に禁止語彙が含まれない', () => {
    expect(findBannedWords(REASSURANCE_MAIN_TEXT)).toEqual([])
  })

  test('REASSURANCE_SUB_TEXT に禁止語彙が含まれない', () => {
    expect(findBannedWords(REASSURANCE_SUB_TEXT)).toEqual([])
  })

  test('REASSURANCE_RETURN_TEXT に禁止語彙が含まれない', () => {
    expect(findBannedWords(REASSURANCE_RETURN_TEXT)).toEqual([])
  })

  test('REASSURANCE_CTA_LABEL に禁止語彙が含まれない', () => {
    expect(findBannedWords(REASSURANCE_CTA_LABEL)).toEqual([])
    expect(findBannedWords(REASSURANCE_CTA_LABEL_RETURN)).toEqual([])
  })

  test('REASSURANCE_SUB_TEXT に「地図」比喩が含まれる（脱判定化の核心）', () => {
    expect(REASSURANCE_SUB_TEXT).toContain('地図')
  })

  test('REASSURANCE_SUB_TEXT に招待ワードが含まれる', () => {
    expect(REASSURANCE_SUB_TEXT).toContain('一緒に')
  })
})

describe('lib/prompts: chat-phase1 — 禁止語彙チェック（F4 Phase 1 傾聴）', () => {
  test('CHAT_PHASE1_SYSTEM_PROMPT に禁止語彙が含まれない', () => {
    expect(findBannedWords(CHAT_PHASE1_SYSTEM_PROMPT)).toEqual([])
  })

  test('CHAT_PHASE1_SYSTEM_PROMPT に傾聴フェーズの必須キーワードが含まれる', () => {
    const listeningKeywords = ['聴く', '受け取', '感情']
    expect(listeningKeywords.some((k) => CHAT_PHASE1_SYSTEM_PROMPT.includes(k))).toBe(true)
  })

  test('CHAT_PHASE1_SYSTEM_PROMPT にタイプ分類禁止の明示がある', () => {
    expect(CHAT_PHASE1_SYSTEM_PROMPT).toContain('タイプ分類')
  })
})

describe('lib/prompts: chat-phase2 — 禁止語彙チェック（F4 Phase 2 共感）', () => {
  test('CHAT_PHASE2_SYSTEM_PROMPT に禁止語彙が含まれない', () => {
    expect(findBannedWords(CHAT_PHASE2_SYSTEM_PROMPT)).toEqual([])
  })

  test('buildChatPhase2Prompt: 展開後のプロンプトにも禁止語彙が含まれない', () => {
    const built = buildChatPhase2Prompt('MBTI: INFJ / 星座: 乙女座 / 動物: コアラ / 六星: 土星人')
    expect(findBannedWords(built)).toEqual([])
  })

  test('buildChatPhase2Prompt: {diagnosisContext} が実際のデータに置換される', () => {
    const context = 'MBTI: ENFP / 星座: 牡羊座'
    const built = buildChatPhase2Prompt(context)
    expect(built).toContain(context)
    expect(built).not.toContain('{diagnosisContext}')
  })

  test('CHAT_PHASE2_SYSTEM_PROMPT に共感フェーズの必須キーワードが含まれる', () => {
    const empathyKeywords = ['感情', '言語化', '共感']
    expect(empathyKeywords.some((k) => CHAT_PHASE2_SYSTEM_PROMPT.includes(k))).toBe(true)
  })
})
