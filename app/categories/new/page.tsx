"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLedger } from "@/context/ledger-context";
import { PageFrame } from "@/components/page-frame";
import { deriveUniquePrefixFromLabel } from "@/lib/derive-prefix-from-label";

export default function CategoryNewPage() {
  const router = useRouter();
  const { addCategory, ready, categories } = useLedger();
  const [label, setLabel] = useState("");
  const [prefix, setPrefix] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const prefixUserEdited = useRef(false);

  const taken = useMemo(() => new Set(categories.map((c) => c.prefix)), [categories]);

  useEffect(() => {
    if (prefixUserEdited.current) return;
    const t = label.trim();
    if (!t) {
      setPrefix("");
      return;
    }
    setPrefix(deriveUniquePrefixFromLabel(t, taken));
  }, [label, taken]);

  const submit = () => {
    setError(null);
    const r = addCategory(label, prefix, notes);
    if (!r.ok) {
      setError(r.message);
      return;
    }
    router.push("/categories");
  };

  const regenerateFromLabel = () => {
    prefixUserEdited.current = false;
    const t = label.trim();
    if (!t) {
      setPrefix("");
      return;
    }
    setPrefix(deriveUniquePrefixFromLabel(t, taken));
  };

  const onPrefixChange = (value: string) => {
    prefixUserEdited.current = true;
    setPrefix(value.toLowerCase());
  };

  if (!ready) {
    return (
      <PageFrame title="カテゴリー新規作成" description="読み込み中…">
        <p className="text-sm text-zinc-500">データを読み込んでいます。</p>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      title="カテゴリー新規作成"
      description="カテゴリー名を入力すると、名前に基づき英小文字5文字のプレフィックスを自動で入れます（重複時は別候補に調整）。"
    >
      <div className="max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="new-label" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              カテゴリー名
            </label>
            <input
              id="new-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="例：プロジェクト、在庫管理"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="new-prefix" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                英字5文字（自動）
              </label>
              <button
                type="button"
                onClick={regenerateFromLabel}
                disabled={!label.trim()}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 dark:text-indigo-400"
              >
                名前から再提案
              </button>
            </div>
            <input
              id="new-prefix"
              type="text"
              value={prefix}
              onChange={(e) => onPrefixChange(e.target.value)}
              placeholder="名前入力で自動"
              maxLength={5}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              英字が含まれる名前はその先頭を優先し、日本語のみの場合は名前から一意になりやすい5文字を生成します。手入力で上書きできます。
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="new-notes" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              備考（任意）
            </label>
            <textarea
              id="new-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="用途・メモなど"
              className="resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={submit}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              追加する
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
