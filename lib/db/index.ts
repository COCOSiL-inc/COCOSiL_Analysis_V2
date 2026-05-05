import "server-only";
import type { DbRepository } from "./types";

export type { DbRepository, MbtiResultInsert } from "./types";

let _repository: DbRepository | null = null;

export function getRepository(): DbRepository {
  if (_repository) return _repository;

  // NEXT_PUBLIC_SUPABASE_URL が設定されていれば本番（Supabase）、なければローカル（SQLite）
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _repository = (require("./supabase") as typeof import("./supabase")).supabaseRepository;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _repository = (require("./sqlite") as typeof import("./sqlite")).sqliteRepository;
  }

  return _repository!;
}
