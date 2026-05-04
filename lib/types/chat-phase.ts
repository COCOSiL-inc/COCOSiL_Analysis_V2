import type { UxPhase } from '@/lib/constitution/ux-sequence'

export const ChatPhase = {
  listening: "listening",
  empathy: "empathy",
  exploring: "exploring",
  insight: "insight",
  action: "action",
} as const;

export type ChatPhase = (typeof ChatPhase)[keyof typeof ChatPhase];

export const CHAT_PHASE_ORDER: ChatPhase[] = [
  ChatPhase.listening,
  ChatPhase.empathy,
  ChatPhase.exploring,
  ChatPhase.insight,
  ChatPhase.action,
];

// 実装フェーズ（5段階）→ 設計中枢UXフェーズ（4段階）マッピング
// listening / empathy は止（反応を止める）= 共感フェーズ
// exploring / insight は観（パターンを命名する）= 分析フェーズ
// 注: safety（安心）フェーズは listening→empathy の遷移の中で達成される想定。
//     F3実装時に明示的フェーズとして分離するか判断する。
export const CHAT_PHASE_TO_UX_PHASE: Record<ChatPhase, UxPhase> = {
  listening: 'empathy',
  empathy:   'empathy',
  exploring: 'analysis',
  insight:   'analysis',
  action:    'action',
} as const
