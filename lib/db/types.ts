export interface MbtiResultInsert {
  mbti_type: string
  scores: Record<string, number>
  pci: Record<string, number>
  answers: unknown
  user_id?: string | null
}

export interface DbRepository {
  insertMbtiResult(row: MbtiResultInsert): Promise<{ id: string } | null>
}
