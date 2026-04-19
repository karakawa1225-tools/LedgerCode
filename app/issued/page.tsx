"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLedger } from "@/context/ledger-context";
import { PageFrame } from "@/components/page-frame";
import { IssuedTable } from "@/components/issued-table";
import { BarcodeZipDownload } from "@/components/barcode-zip-download";
import { IssuedListPdfExport } from "@/components/issued-list-pdf-export";
import { groupIssuesByCategory } from "@/lib/group-issues-by-category";

export default function IssuedListPage() {
  const { issues, categories, ready, removeIssue, clearAllIssues } = useLedger();
  const [pageIndex, setPageIndex] = useState(0);

  const groups = useMemo(
    () => groupIssuesByCategory(issues, categories),
    [issues, categories],
  );

  useEffect(() => {
    setPageIndex((i) => {
      if (groups.length === 0) return 0;
      return Math.min(i, groups.length - 1);
    });
  }, [groups.length]);

  const current = groups[pageIndex];

  if (!ready) {
    return (
      <PageFrame title="発行一覧・バーコード" description="読み込み中…">
        <p className="text-sm text-zinc-500">データを読み込んでいます。</p>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      title="発行一覧・バーコード"
      description="カテゴリー別にバーコードを表示。PNGで1件ずつ保存する、ZIPでまとめて保存する、PDFに出力する、ができます。"
    >
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        サマリーは{" "}
        <Link href="/home" className="font-medium text-indigo-600 underline dark:text-indigo-400">
          ホーム
        </Link>
        からも確認できます。
      </p>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              発行済み一覧（カテゴリー別）
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {issues.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      typeof window !== "undefined" &&
                      window.confirm(
                        "すべての発行データを削除します（All clear）。この操作は取り消せません。よろしいですか？",
                      )
                    ) {
                      clearAllIssues();
                      setPageIndex(0);
                    }
                  }}
                  className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-800 shadow-sm transition hover:bg-red-50 dark:border-red-800 dark:bg-zinc-950 dark:text-red-300 dark:hover:bg-red-950/30"
                >
                  All clear
                </button>
              ) : null}
              <IssuedListPdfExport groups={groups} />
            </div>
          </div>
          {issues.length > 0 ? (
            <div className="flex flex-col gap-2 rounded-lg border border-dashed border-teal-200/80 bg-teal-50/40 p-3 dark:border-teal-900/50 dark:bg-teal-950/20">
              <p className="text-xs font-medium text-teal-900 dark:text-teal-200">
                バーコード画像の保存（お使いのPCにダウンロード）
              </p>
              <div className="flex flex-wrap gap-2">
                <BarcodeZipDownload issues={issues} variant="all" />
                <BarcodeZipDownload
                  issues={current?.rows ?? []}
                  variant="current"
                  disabled={!current || current.rows.length === 0}
                />
              </div>
              <p className="text-[11px] leading-relaxed text-teal-800/90 dark:text-teal-300/90">
                各行の「PNG保存」で1件ずつ。ZIPはフォルダ内に <span className="font-mono">生成ID.png</span>{" "}
                が並びます。データはブラウザ内に残るほか、画像ファイルとして手元保管できます。
              </p>
            </div>
          ) : null}
        </div>

        {groups.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            まだ発行されていません
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/50 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
                  disabled={pageIndex <= 0}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  前へ
                </button>
                <span className="min-w-[5rem] text-center text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                  {pageIndex + 1} / {groups.length}
                </span>
                <button
                  type="button"
                  onClick={() => setPageIndex((i) => Math.min(groups.length - 1, i + 1))}
                  disabled={pageIndex >= groups.length - 1}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  次へ
                </button>
              </div>
              <label className="flex min-w-[12rem] flex-1 flex-col gap-1 sm:max-w-md sm:flex-row sm:items-center sm:gap-2">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">カテゴリー</span>
                <select
                  value={pageIndex}
                  onChange={(e) => setPageIndex(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  {groups.map((g, i) => (
                    <option key={g.category.id} value={i}>
                      {g.category.label} [{g.category.prefix}] — {g.rows.length}件
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {current ? (
              <div>
                <h3 className="mb-3 flex flex-wrap items-baseline gap-2 border-b border-zinc-200 pb-2 text-base font-semibold text-zinc-900 dark:border-zinc-700 dark:text-zinc-50">
                  <span>{current.category.label}</span>
                  <span className="font-mono text-sm font-normal text-zinc-500 dark:text-zinc-400">
                    [{current.category.prefix}]
                  </span>
                  <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
                    （{current.rows.length} 件）
                  </span>
                </h3>
                <IssuedTable
                  issues={current.rows}
                  showBarcode
                  onDeleteRow={(codeId) => {
                    const r = removeIssue(codeId);
                    if (!r.ok && typeof window !== "undefined") {
                      window.alert(r.message);
                    }
                  }}
                />
              </div>
            ) : null}
          </div>
        )}
      </section>
    </PageFrame>
  );
}
