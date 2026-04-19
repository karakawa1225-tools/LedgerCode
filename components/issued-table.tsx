"use client";

import type { IssuedRow } from "@/lib/code-system";
import { BarcodeCode128 } from "@/components/barcode-code128";
import { SaveBarcodeButton } from "@/components/save-barcode-button";

type Props = {
  issues: IssuedRow[];
  /** true: バーコード列あり（一覧・PDF画面向け） / false: 項目名・IDのみ（ホーム向け） */
  showBarcode?: boolean;
  /** 指定時は行ごとに削除（一覧・PDF画面向け） */
  onDeleteRow?: (codeId: string) => void;
};

export function IssuedTable({ issues, showBarcode = false, onDeleteRow }: Props) {
  const showDelete = Boolean(onDeleteRow);
  const colCount = showBarcode ? (showDelete ? 5 : 4) : showDelete ? 3 : 2;

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table
        className={`w-full border-collapse text-left text-sm ${showBarcode ? "min-w-[640px]" : "min-w-[320px]"}`}
      >
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">項目名</th>
            <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">生成ID</th>
            {showBarcode && showDelete ? (
              <th className="w-24 whitespace-nowrap px-3 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                削除
              </th>
            ) : null}
            {showBarcode ? (
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                バーコード（CODE128）
              </th>
            ) : null}
            {showBarcode ? (
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">画像保存</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {issues.length === 0 ? (
            <tr>
              <td
                colSpan={colCount}
                className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400"
              >
                まだ発行されていません
              </td>
            </tr>
          ) : (
            issues.map((row) => (
              <tr
                key={row.codeId}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
              >
                <td className="px-4 py-3 align-top text-zinc-900 dark:text-zinc-100">{row.itemName}</td>
                <td className="px-4 py-3 align-top font-mono text-zinc-800 tabular-nums dark:text-zinc-200">
                  {row.codeId}
                </td>
                {showBarcode && onDeleteRow ? (
                  <td className="whitespace-nowrap px-3 py-3 align-middle">
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          typeof window !== "undefined" &&
                          window.confirm(
                            `この発行を削除しますか？\n${row.itemName}\n${row.codeId}`,
                          )
                        ) {
                          onDeleteRow(row.codeId);
                        }
                      }}
                      className="rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 dark:border-red-900/60 dark:bg-zinc-950 dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                      削除
                    </button>
                  </td>
                ) : null}
                {showBarcode ? (
                  <td className="px-4 py-3 align-middle">
                    <div className="inline-block max-w-[min(100%,220px)]">
                      <BarcodeCode128 text={row.codeId} className="max-h-14 w-auto" />
                    </div>
                  </td>
                ) : null}
                {showBarcode ? (
                  <td className="px-4 py-3 align-middle">
                    <SaveBarcodeButton codeId={row.codeId} />
                  </td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
