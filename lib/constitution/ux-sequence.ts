// COCOSiL Constitution: UXシーケンス順序の machine-readable 定義
// 設計中枢の非交渉項目「共感→安心→分析→行動」の止観構造をコードに固定する
// この順序の変更は Autogenesis Constitution §「絶対不変」に該当 — Mutable ではない
//
// ⚠️ 既存ドリフトの記録（C1 症状の一例）:
//   lib/types/chat-phase.ts に5フェーズ（listening/empathy/exploring/insight/action）が
//   先行実装されており、設計中枢の4フェーズと命名がドリフトしている。
//   コードに正（Constitution as Code）がなかったため、実装が独自進化した。
//   本ファイルは設計中枢を正とする。chat-phase.ts との統合・移行は別タスクで実施。

export const UX_SEQUENCE = ['empathy', 'safety', 'analysis', 'action'] as const

export type UxPhase = (typeof UX_SEQUENCE)[number]

export const PHASE_LABELS_JP: Record<UxPhase, string> = {
  empathy: '共感',
  safety: '安心',
  analysis: '分析',
  action: '行動',
}

// 順方向の遷移（同一フェーズ滞在 OR 次フェーズ進行）のみ許可。逆行は不許可。
export function isValidTransition(from: UxPhase | null, to: UxPhase): boolean {
  if (from === null) return to === 'empathy'
  const fromIdx = UX_SEQUENCE.indexOf(from)
  const toIdx = UX_SEQUENCE.indexOf(to)
  return toIdx === fromIdx || toIdx === fromIdx + 1
}

export function isUxPhase(value: unknown): value is UxPhase {
  return typeof value === 'string' && (UX_SEQUENCE as readonly string[]).includes(value)
}
