"use client";

import { useMemo } from "react";
import { useLedger } from "@/context/ledger-context";
import { PageFrame } from "@/components/page-frame";
import Link from "next/link";
import { IssuedTable } from "@/components/issued-table";
import { prefixFromCodeId } from "@/lib/ledger-storage";

export default function HomePage() {
  const { issues, categories, ready } = useLedger();

  const stats = useMemo(() => {
    const byPrefix = new Map<string, number>();
    for (const row of issues) {
      const p = prefixFromCodeId(row.codeId);
      if (!p) continue;
      byPrefix.set(p, (byPrefix.get(p) ?? 0) + 1);
    }
    return {
      total: issues.length,
      categoryCount: categories.length,
      byPrefix,
    };
  }, [issues, categories]);

  if (!ready) {
    return (
      <PageFrame title="ホーム" description="読み込み中…">
        <p className="text-sm text-zinc-500">データを読み込んでいます。</p>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      title="ホーム"
      description="ダッシュボードと発行済みコードの簡易一覧です。バーコード表示・PDF出力は「発行一覧・バーコード」画面へ。"
    >
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            総発行数
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {stats.total}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            カテゴリー数
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {stats.categoryCount}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            プレフィックス別（件数）
          </p>
          <ul className="mt-2 max-h-24 space-y-1 overflow-y-auto text-sm text-zinc-700 dark:text-zinc-300">
            {categories.map((c) => (
              <li key={c.id} className="flex justify-between gap-2 font-mono text-xs">
                <span>{c.prefix}</span>
                <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
                  {stats.byPrefix.get(c.prefix) ?? 0}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            発行済み一覧（簡易）
          </h2>
          <Link
            href="/issued"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            バーコード・PDFはこちら →
          </Link>
        </div>
        <IssuedTable issues={issues} />
      </section>
    </PageFrame>
  );
}
