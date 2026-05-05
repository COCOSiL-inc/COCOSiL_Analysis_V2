import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import path from "path";
import type { DbRepository, MbtiResultInsert } from "./types";

const db = new Database(path.join(process.cwd(), "dev.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS mbti_results (
    id         TEXT PRIMARY KEY,
    mbti_type  TEXT NOT NULL,
    scores     TEXT NOT NULL,
    pci        TEXT NOT NULL,
    answers    TEXT,
    user_id    TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )
`);

export const sqliteRepository: DbRepository = {
  async insertMbtiResult(row: MbtiResultInsert) {
    try {
      const id = randomUUID();
      db.prepare(
        `INSERT INTO mbti_results (id, mbti_type, scores, pci, answers, user_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
      ).run(
        id,
        row.mbti_type,
        JSON.stringify(row.scores),
        JSON.stringify(row.pci),
        row.answers != null ? JSON.stringify(row.answers) : null,
        row.user_id ?? null,
      );
      return { id };
    } catch (err) {
      console.error("SQLite insert error:", err);
      return null;
    }
  },
};
