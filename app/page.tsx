import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "COCOSiL — 自己理解で、人間関係を変える",
  description:
    "なぜ同じことで繰り返し消耗するのか。MBTIをはじめとした性格分析が、その根っこにあるパターンを見えるようにします。",
};

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-16"
      style={{
        background:
          "linear-gradient(170deg, var(--background) 0%, #12122a 40%, #1a1038 100%)",
      }}
    >
      <main className="w-full max-w-md flex flex-col items-center gap-10 text-center">

        {/* ロゴ */}
        <div className="flex flex-col items-center gap-1">
          <span
            className="text-3xl font-bold tracking-tight"
            style={{
              background:
                "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            COCOSiL
          </span>
          <span className="text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
            Self-Knowing for Better-Relating
          </span>
        </div>

        {/* 共感 */}
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold leading-snug tracking-tight">
            なぜ、同じことで<br />繰り返し消耗するんだろう。
          </h1>
          <p className="text-sm leading-7" style={{ color: "var(--text-muted)" }}>
            職場でも、家族でも、恋愛でも。<br />
            パターンはいつも同じなのに、理由がわからない。
          </p>
        </div>

        {/* 安心 */}
        <div
          className="w-full rounded-2xl p-5 text-left"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          <p className="text-sm leading-7">
            その消耗には、<strong>理由があります。</strong><br />
            自分と相手の性格パターンを知ると、<br />
            反応してしまう仕組みが見えてくる。
          </p>
        </div>

        {/* 分析 */}
        <div className="w-full flex flex-col gap-3">
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--accent-primary)" }}>
            Step 1 — MBTI 性格分析
          </p>
          <div
            className="w-full rounded-2xl p-5 text-left flex flex-col gap-2"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
            }}
          >
            <p className="font-semibold text-sm">12問の簡易診断</p>
            <p className="text-sm leading-6" style={{ color: "var(--text-muted)" }}>
              直感で答えるだけ。3分で、16タイプのうち<br />
              あなたの傾向が見えてきます。
            </p>
          </div>
        </div>

        {/* 行動 */}
        <Link
          href="/diagnosis/mbti"
          className="w-full flex items-center justify-center h-14 rounded-2xl font-semibold text-base text-white transition-transform hover:-translate-y-0.5"
          style={{
            background:
              "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
            boxShadow: "0 4px 20px var(--accent-glow)",
          }}
        >
          性格分析をはじめる →
        </Link>

        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          無料・登録不要・3分
        </p>
      </main>
    </div>
  );
}
