import type { ChatPhase } from '@/lib/types/chat-phase'
import { getPostHogClient } from './client'

// ── イベント payload 型 ───────────────────────────────────────────────────

export type ChatPhaseTransitionPayload = {
  from_phase: ChatPhase | null
  to_phase: ChatPhase
  session_id: string
}

export type ReportSectionRereadPayload = {
  section: string       // 'mbti' | 'zodiac' | 'animal' | 'rokusei' | 'summary'
  reread_count: number
  session_id: string
}

export type InsightAcceptPayload = {
  session_id: string
  message_index: number  // チャット内の何番目のメッセージで受容反応が出たか
}

export type ActionSpecificityPayload = {
  session_id: string
  score: number         // 1〜5: 1=抽象的「もっと優しくする」, 5=具体的「週2回5分話す」
  raw_text: string
}

export type SessionReturn7dPayload = {
  last_session_at: string   // ISO8601
  days_since_last: number
}

// ── 送信ヘルパー ──────────────────────────────────────────────────────────

function capture(userId: string, event: string, payload: Record<string, unknown>): void {
  const client = getPostHogClient()
  if (!client) return
  client.capture({ distinctId: userId, event, properties: payload })
}

// Autogenesis Phase A: 観察基盤イベント5種

export function trackChatPhaseTransition(
  userId: string,
  payload: ChatPhaseTransitionPayload,
): void {
  capture(userId, 'chat_phase_transition', payload)
}

export function trackReportSectionReread(
  userId: string,
  payload: ReportSectionRereadPayload,
): void {
  capture(userId, 'report_section_reread', payload)
}

export function trackInsightAccept(
  userId: string,
  payload: InsightAcceptPayload,
): void {
  capture(userId, 'insight_accept', payload)
}

export function trackActionSpecificityScore(
  userId: string,
  payload: ActionSpecificityPayload,
): void {
  capture(userId, 'action_specificity_score', payload)
}

export function trackSessionReturn7d(
  userId: string,
  payload: SessionReturn7dPayload,
): void {
  capture(userId, 'session_return_7d', payload)
}
