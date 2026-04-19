"use client";

import { useCallback } from "react";
import type { CategoryIssueGroup } from "@/lib/group-issues-by-category";
import { buildIssuedListCsv } from "@/lib/export-issued-csv";

type Props = {
  groups: CategoryIssueGroup[];
};

export function IssuedListCsvExport({ groups }: Props) {
  const issueCount = groups.reduce((n, g) => n + g.rows.length, 0);

  const onDownload = useCallback(() => {
    if (issueCount === 0 || typeof window === "undefined") return;
    const csv = buildIssuedListCsv(groups);
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    a.download = `管理コード一覧_${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [groups, issueCount]);

  return (
    <button
      type="button"
      onClick={onDownload}
      disabled={issueCount === 0}
      className="inline-flex w-fit items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
    >
      CSV出力
    </button>
  );
}
