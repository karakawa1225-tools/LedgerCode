"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLedger } from "@/context/ledger-context";
import { PageFrame } from "@/components/page-frame";
import { formatSerial } from "@/lib/code-system";

export default function IssuePage() {
  const router = useRouter();
  const { categories, issueCode, ready, nextSerialByPrefix } = useLedger();
  const [selectedId, setSelectedId] = useState<string>("");
  const [itemName, setItemName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || categories.length === 0) return;
    setSelectedId((prev) =>
      prev && categories.some((c) => c.id === prev) ? prev : categories[0].id,
    );
  }, [ready, categories]);

  const selected = useMemo(
    () => categories.find((c) => c.id === selectedId),
    [categories, selectedId],
  );

  const submit = () => {
    setError(null);
    const r = issueCode(selectedId, itemName);
    if (!r.ok) {
      setError(r.message);
      return;
    }
    setItemName("");
    router.push("/home");
  };

  if (!ready) {
    return (
      <PageFrame title="コード発行" description="読み込み中…">
        <p className="text-sm text-zinc-500">データを読み込んでいます。</p>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      title="コード発行"
      description="カテゴリーと項目名を選び、13桁のコードを発行します。発行後はホームの一覧へ移動します。"
    >
      <div className="max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="issue-category" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              カテゴリー
            </label>
            <select
              id="issue-category"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}（{c.prefix}）
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="issue-item" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              項目名
            </label>
            <input
              id="issue-item"
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="例：株式会社サンプル"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          {selected ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              次に発行される連番:{" "}
              <span className="font-mono">
                {formatSerial(nextSerialByPrefix[selected.prefix] ?? 1)}
              </span>
              {((nextSerialByPrefix[selected.prefix] ?? 1) > 999) ? (
                <span className="text-red-600 dark:text-red-400">（上限に達しています）</span>
              ) : null}
            </p>
          ) : null}
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={submit}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            コード発行
          </button>
        </div>
      </div>
    </PageFrame>
  );
}
