// このファイルは自動生成されます。手動で編集しないこと。
// 生成コマンド: pnpm db:types
// 前提: supabase login && supabase link --project-ref nrvfmvdozgavohmduttn

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
