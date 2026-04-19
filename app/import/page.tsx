"use client";

import Link from "next/link";
import { useState } from "react";
import { useLedger } from "@/context/ledger-context";
import { PageFrame } from "@/components/page-frame";
import { CSV_TEMPLATE, parseCategoryItemCsv } from "@/lib/parse-csv";

export default function CsvImportPage() {
  const { bulkImportIssues, ready, categories } = useLedger();
  const [text, setText] = useState("");
  const [parseErr, setParseErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ imported: number; failed: { line: number; message: string }[] } | null>(
    null,
  );

  const handleImport = () => {
    setResult(null);
    const parsed = parseCategoryItemCsv(text);
    if (parsed.errors.length > 0) {
      setParseErr(parsed.errors.join("\n"));
      return;
    }
    setParseErr(null);
    if (parsed.rows.length === 0) {
      setParseErr("取り込むデータ行がありません。");
      return;
    }
    const { imported, failed } = bulkImportIssues(parsed.rows);
    setResult({ imported, failed });
  };

  const downloadTemplate = () => {
    const bom = "\uFEFF";
    const blob = new Blob([bom + CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setText(typeof reader.result === "string" ? reader.result : "");
      setParseErr(null);
      setResult(null);
    };
    reader.readAsText(f, "UTF-8");
    e.target.value = "";
  };

  if (!ready) {
    return (
      <PageFrame title="CSV一括取り込み" description="読み込み中…">
        <p className="text-sm text-zinc-500">データを読み込んでいます。</p>
      </PageFrame>
    );
  }

  const preview = parseCategoryItemCsv(text);

  return (
    <PageFrame
      title="CSV一括取り込み"
      description="カテゴリーと項目名のCSVを取り込み、行ごとに管理コードを発行します。発行後は一覧・バーコード画面でPDF保存できます。"
    >
      <div className="flex flex-col gap-6">
        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">形式</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <li>1行目はヘッダ。列名に「カテゴリー」と「項目名」（英語は category / item など可）を含めてください。</li>
            <li>
              カテゴリー列には、登録済みの<strong>カテゴリー名</strong>（例: 顧客管理）または<strong>英小文字5文字のプレフィックス</strong>（例:
              custm）を入れてください。
            </li>
            <li>文字コードは UTF-8（Excelなら「CSV UTF-8（コンマ区切り）」で保存推奨）。</li>
          </ul>
          <button
            type="button"
            onClick={downloadTemplate}
            className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            雛形CSVをダウンロード
          </button>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
            CSVファイル
          </label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={onFile}
            className="mt-2 block w-full max-w-md text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border file:border-zinc-300 file:bg-zinc-50 file:px-3 file:py-1.5 file:text-sm dark:text-zinc-400 dark:file:border-zinc-600 dark:file:bg-zinc-900"
          />
          <label className="mt-4 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
            または貼り付け
          </label>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setParseErr(null);
              setResult(null);
            }}
            rows={12}
            placeholder={CSV_TEMPLATE}
            className="mt-2 w-full max-w-3xl rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </section>

        {parseErr ? (
          <p className="whitespace-pre-wrap text-sm text-red-600 dark:text-red-400" role="alert">
            {parseErr}
          </p>
        ) : null}

        {preview.errors.length === 0 && preview.rows.length > 0 && !result && !parseErr ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            解析済み: <strong>{preview.rows.length}</strong> 行（データ）
          </p>
        ) : null}

        {result ? (
          <div
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm dark:border-emerald-900 dark:bg-emerald-950/40"
            role="status"
          >
            <p className="font-medium text-emerald-900 dark:text-emerald-100">
              発行完了: {result.imported} 件を取り込みました。
            </p>
            {result.failed.length > 0 ? (
              <div className="mt-2 text-emerald-900 dark:text-emerald-200">
                <p className="font-medium">スキップ {result.failed.length} 件:</p>
                <ul className="mt-1 max-h-40 list-inside list-disc overflow-y-auto font-mono text-xs">
                  {result.failed.map((f, i) => (
                    <li key={`${f.line}-${i}-${f.message}`}>
                      行 {f.line}: {f.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="mt-3">
              <Link
                href="/issued"
                className="font-medium text-indigo-700 underline dark:text-indigo-300"
              >
                一覧・バーコード・PDF出力へ →
              </Link>
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleImport}
            disabled={!text.trim()}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            取り込んでコード発行
          </button>
          <Link
            href="/issued"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200"
          >
            一覧へ
          </Link>
        </div>

        <section className="text-xs text-zinc-500 dark:text-zinc-500">
          <p className="font-medium text-zinc-700 dark:text-zinc-400">登録中のカテゴリー（照合用）</p>
          <ul className="mt-1 flex flex-wrap gap-2">
            {categories.map((c) => (
              <li key={c.id} className="rounded-md bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                {c.label} <span className="font-mono text-zinc-600 dark:text-zinc-400">[{c.prefix}]</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageFrame>
  );
}
