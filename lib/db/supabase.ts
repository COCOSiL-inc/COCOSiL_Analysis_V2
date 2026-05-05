import { getSupabaseClient } from "@/utils/supabase/client";
import type { Json, TablesInsert } from "@/lib/types/database";
import type { DbRepository, MbtiResultInsert } from "./types";

export const supabaseRepository: DbRepository = {
  async insertMbtiResult(row: MbtiResultInsert) {
    const supabase = getSupabaseClient();
    const insertRow: TablesInsert<"mbti_results"> = {
      mbti_type: row.mbti_type,
      scores: row.scores as unknown as Json,
      pci: row.pci as unknown as Json,
      answers: (row.answers as unknown as Json) ?? null,
    };
    const { data, error } = await supabase
      .from("mbti_results")
      .insert(insertRow)
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return null;
    }
    return data ? { id: data.id } : null;
  },
};
