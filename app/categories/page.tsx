"use client";

import { useMemo, useState } from "react";
import { useLedger } from "@/context/ledger-context";
import { PageFrame } from "@/components/page-frame";
import { BUILTIN_PREFIXES, type Category } from "@/lib/code-system";
import { prefixFromCodeId } from "@/lib/ledger-storage";

export default function CategoriesPage() {
  const { categories, issues, updateCategory, removeCategory, ready } = useLedger();
  const [editing, setEditing] = useState<Category | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editPrefix, setEditPrefix] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const issuedByPrefix = useMemo(() => {
    const s = new Set<string>();
    for (const row of issues) {
      const p = prefixFromCodeId(row.codeId);
      if (p) s.add(p);
    }
    return s;
  }, [issues]);

  const openEdit = (c: Category) => {
    setEditing(c);
    setEditLabel(c.label);
    setEditPrefix(c.prefix);
    setEditNotes(c.notes ?? "");
    setFormError(null);
  };

  const closeEdit = () => {
    setEditing(null);
    setFormError(null);
  };

  const saveEdit = () => {
    if (!editing) return;
    setFormError(null);
    const r = updateCategory(editing.id, { label: editLabel, prefix: editPrefix, notes: editNotes });
    if (!r.ok) {
      setFormError(r.message);
      return;
    }
    closeEdit();
  };

  const onDelete = (c: Category) => {
    setActionError(null);
    const ok = window.confirm(`「${c.label}」を削除しますか？`);
    if (!ok) return;
    const r = removeCategory(c.id);
    if (!r.ok) {
      setActionError(r.message);
      return;
    }
  };

  if (!ready) {
    return (
      <PageFrame title="カテゴリー管理" description="読み込み中…">
        <p className="text-sm text-zinc-500">データを読み込んでいます。</p>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      title="カテゴリー管理"
      description="名前・備考の編集、プレフィックスの変更（発行履歴がある場合や組み込みカテゴリーでは制限あり）、削除ができます。"
    >
      {actionError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {actionError}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full min-w-[480px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">カテゴリー名</th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">プレフィックス</th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">備考</th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => {
              const builtin = BUILTIN_PREFIXES.has(c.prefix);
              const hasIssued = issuedByPrefix.has(c.prefix);
              return (
                <tr key={c.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                  <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">{c.label}</td>
                  <td className="px-4 py-3 font-mono text-zinc-800 dark:text-zinc-200">{c.prefix}</td>
                  <td className="max-w-[16rem] px-4 py-3 align-top text-xs text-zinc-700 dark:text-zinc-300">
                    <p className="whitespace-pre-wrap break-words">
                      {c.notes?.trim() ? c.notes : "—"}
                    </p>
                    <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                      {builtin ? "組み込み" : "追加"}
                      {hasIssued ? "・発行履歴あり" : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(c)}
                        disabled={builtin}
                        className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing ? (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-title"
        >
          <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <h2 id="edit-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              カテゴリーを編集
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="edit-label" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  カテゴリー名
                </label>
                <input
                  id="edit-label"
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="edit-prefix" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  プレフィックス（英小文字5文字）
                </label>
                <input
                  id="edit-prefix"
                  type="text"
                  value={editPrefix}
                  onChange={(e) => setEditPrefix(e.target.value.toLowerCase())}
                  maxLength={5}
                  disabled={
                    BUILTIN_PREFIXES.has(editing.prefix) ||
                    issuedByPrefix.has(editing.prefix)
                  }
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm disabled:cursor-not-allowed disabled:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:disabled:bg-zinc-800"
                />
                {BUILTIN_PREFIXES.has(editing.prefix) ? (
                  <p className="text-xs text-zinc-500">組み込みカテゴリーのプレフィックスは変更できません。</p>
                ) : issuedByPrefix.has(editing.prefix) ? (
                  <p className="text-xs text-zinc-500">
                    発行履歴があるためプレフィックスは変更できません（名前のみ変更可能）。
                  </p>
                ) : (
                  <p className="text-xs text-zinc-500">
                    未発行のカテゴリーはプレフィックスを変更できます。
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="edit-notes" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  備考
                </label>
                <textarea
                  id="edit-notes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  placeholder="メモ・用途など"
                  className="resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
              {formError ? (
                <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
              ) : null}
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageFrame>
  );
}
