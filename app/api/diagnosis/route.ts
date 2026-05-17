import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';

export interface DiagnosisAllResult {
  mbti: {
    mbtiType: string;
    pci: Record<string, number>;
  } | null;
  zodiacSign: string | null;
  animalType: string | null;
  animalCharacter: string | null;
  sixStar: string | null;
}

export interface DiagnosisAllResponse {
  success: boolean;
  result?: DiagnosisAllResult;
  error?: string;
}

export async function GET() {
  const { userId, getToken } = await auth();
  if (!userId) {
    return NextResponse.json<DiagnosisAllResponse>(
      { success: false, error: '認証が必要です' },
      { status: 401 },
    );
  }

  try {
    const token = await getToken({ template: 'supabase' });
    const supabase = createSupabaseServerClient(token);

    const [diagResult, mbtiResult] = await Promise.all([
      supabase
        .from('diagnoses')
        .select('zodiac_sign, animal_type, animal_character, six_star')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('mbti_results')
        .select('mbti_type, pci')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (diagResult.error) {
      console.error('diagnoses fetch error:', diagResult.error);
    }
    if (mbtiResult.error) {
      console.error('mbti_results fetch error:', mbtiResult.error);
    }

    const result: DiagnosisAllResult = {
      mbti: mbtiResult.data
        ? {
            mbtiType: mbtiResult.data.mbti_type,
            pci: (mbtiResult.data.pci as Record<string, number>) ?? {},
          }
        : null,
      zodiacSign: diagResult.data?.zodiac_sign ?? null,
      animalType: diagResult.data?.animal_type ?? null,
      animalCharacter: diagResult.data?.animal_character ?? null,
      sixStar: diagResult.data?.six_star ?? null,
    };

    return NextResponse.json<DiagnosisAllResponse>({ success: true, result });
  } catch (err) {
    console.error('GET /api/diagnosis error:', err);
    return NextResponse.json<DiagnosisAllResponse>(
      { success: false, error: '診断結果の取得に失敗しました' },
      { status: 500 },
    );
  }
}
