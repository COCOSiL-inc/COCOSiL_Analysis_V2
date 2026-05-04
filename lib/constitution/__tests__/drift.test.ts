import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { BANNED_WORDS } from '@/lib/constitution/banned-words'
import { UX_SEQUENCE, PHASE_LABELS_JP } from '@/lib/constitution/ux-sequence'

const repoRoot = path.resolve(__dirname, '../../..')

function readDoc(relPath: string): string {
  return readFileSync(path.join(repoRoot, relPath), 'utf-8')
}

describe('Constitution Drift: 文書とコードの整合性検知', () => {
  test('language-design-v1.md に列挙された禁止語が banned-words.ts に全て存在', () => {
    const doc = readDoc('docs/input/concepts/language-design-v1.md')
    // 文書側の §1 テーブルに必ず登場する禁止語のサブセット
    const expectedFromDoc = ['占い', '占い師', '鑑定', '運勢', '占星術', '当たる', '霊感', '霊視']
    const codeWords = BANNED_WORDS as readonly string[]
    for (const word of expectedFromDoc) {
      expect(doc, `language-design-v1.md に "${word}" が見つからない`).toContain(word)
      expect(codeWords, `banned-words.ts に "${word}" が含まれていない`).toContain(word)
    }
  })

  test('AGENTS.md §6 の禁止語テーブルに列挙された語も banned-words.ts に含まれる', () => {
    const doc = readDoc('AGENTS.md')
    const codeWords = BANNED_WORDS as readonly string[]
    // AGENTS.md §6 で明記される最小セット
    const expectedFromAgents = ['占い', '鑑定', '運勢', '霊感', '霊視']
    for (const word of expectedFromAgents) {
      expect(doc, `AGENTS.md に "${word}" が見つからない`).toContain(word)
      expect(codeWords, `banned-words.ts に "${word}" が含まれていない`).toContain(word)
    }
  })

  test('cocosil-domain skill の禁止語も banned-words.ts に含まれる', () => {
    const doc = readDoc('.claude/skills/cocosil-domain/SKILL.md')
    const codeWords = BANNED_WORDS as readonly string[]
    const expectedFromSkill = ['占い', '占い師', '鑑定', '運勢', '占星術', '当たる']
    for (const word of expectedFromSkill) {
      expect(doc, `cocosil-domain SKILL.md に "${word}" が見つからない`).toContain(word)
      expect(codeWords, `banned-words.ts に "${word}" が含まれていない`).toContain(word)
    }
  })

  test('UXシーケンスの日本語ラベルが AGENTS.md に明記されている', () => {
    const doc = readDoc('AGENTS.md')
    expect(doc).toContain('共感→安心→分析→行動')
    for (const phase of UX_SEQUENCE) {
      const jp = PHASE_LABELS_JP[phase]
      expect(doc, `AGENTS.md に "${jp}" が見つからない`).toContain(jp)
    }
  })
})
