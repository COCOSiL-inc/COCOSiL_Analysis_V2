import { NextResponse } from "next/server";
import { calculateMbtiResult, isValidMbtiType } from "@/app/diagnosis/mbti/logic";
import { MBTI_QUESTIONS } from "@/app/diagnosis/mbti/questions";
import { getRepository } from "@/lib/db";
import { getPostHogClient } from "@/lib/telemetry/client";
import type {
  DiagnosisResponse,
  LikertValue,
  MbtiAnswer,
} from "@/app/diagnosis/mbti/types";

/**
 * POST /api/diagnosis/mbti
 *
 * リクエストボディ:
 *   通常: { "answers": [{ "questionId": 1, "value": 4 }, ...] }
 *   スキップ: { "directType": "INFJ" }
 *
 * レスポンス: DiagnosisResponse
 */
export async function POST(request: Request) {
  const posthogDistinctId = request.headers.get("X-POSTHOG-DISTINCT-ID") ?? "anonymous";

  try {
    const body = await request.json();
    let result;

    // ---- スキップ (直接選択) ----
    if (body.directType) {
      const type = String(body.directType).toUpperCase();

      if (!isValidMbtiType(type)) {
        return NextResponse.json<DiagnosisResponse>(
          { success: false, error: "無効な MBTI タイプです" },
          { status: 400 },
        );
      }

      result = {
        mbtiType: type,
        scores: { EI: 9, SN: 9, TF: 9, JP: 9 },
        pci: { EI: 0, SN: 0, TF: 0, JP: 0 },
      };
    } else {
      // ---- 通常回答 ----
      const answers: MbtiAnswer[] | undefined = body.answers;

      if (!Array.isArray(answers) || answers.length !== MBTI_QUESTIONS.length) {
        return NextResponse.json<DiagnosisResponse>(
          {
            success: false,
            error: `回答は ${MBTI_QUESTIONS.length} 問分必要です`,
          },
          { status: 400 },
        );
      }

      for (const a of answers) {
        if (
          typeof a.questionId !== "number" ||
          typeof a.value !== "number" ||
          a.value < 1 ||
          a.value > 5
        ) {
          return NextResponse.json<DiagnosisResponse>(
            {
              success: false,
              error: "不正な回答データが含まれています",
            },
            { status: 400 },
          );
        }
      }

      result = calculateMbtiResult(answers as { questionId: number; value: LikertValue }[]);
    }

    // ---- DB に保存（ローカル=SQLite / 本番=Supabase） ----
    const dbResult = await getRepository().insertMbtiResult({
      mbti_type: result.mbtiType,
      scores: result.scores as unknown as Record<string, number>,
      pci: result.pci as unknown as Record<string, number>,
      answers: body.answers ?? null,
    });

    if (dbResult) {
      result.id = dbResult.id;
    }

    const phClient = getPostHogClient();
    if (phClient) {
      phClient.capture({
        distinctId: posthogDistinctId,
        event: "mbti_diagnosis_saved",
        properties: {
          mbti_type: result.mbtiType,
          is_direct_select: !!body.directType,
          result_id: result.id ?? null,
        },
      });
    }

    return NextResponse.json<DiagnosisResponse>({
      success: true,
      result,
    });
  } catch (err) {
    console.error("Diagnosis Route Error:", err);
    return NextResponse.json<DiagnosisResponse>(
      { success: false, error: "リクエストの処理に失敗しました" },
      { status: 500 },
    );
  }
}
