import { NextResponse } from 'next/server';

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

// TODO: 認証実装後に userId でフィルタリング。現在は空レスポンスを返す。
export async function GET() {
  return NextResponse.json<DiagnosisAllResponse>({
    success: true,
    result: {
      mbti: null,
      zodiacSign: null,
      animalType: null,
      animalCharacter: null,
      sixStar: null,
    },
  });
}
