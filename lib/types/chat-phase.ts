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
