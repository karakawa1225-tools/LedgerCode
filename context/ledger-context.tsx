"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  BUILTIN_PREFIXES,
  type Category,
  type IssuedRow,
  buildCodeId,
  isValidPrefix,
  serialFromCodeId,
} from "@/lib/code-system";
import { deriveUniquePrefixFromLabel } from "@/lib/derive-prefix-from-label";
import { matchCategoryByKey } from "@/lib/match-category";
import {
  emptyPersisted,
  loadPersisted,
  savePersisted,
  type Persisted,
  prefixFromCodeId,
} from "@/lib/ledger-storage";

type LedgerContextValue = {
  categories: Category[];
  issues: IssuedRow[];
  nextSerialByPrefix: Record<string, number>;
  ready: boolean;
  issueCode: (categoryId: string, itemName: string) => { ok: true } | { ok: false; message: string };
  addCategory: (
    label: string,
    prefixInput: string,
    notesInput?: string,
  ) => { ok: true; category: Category } | { ok: false; message: string };
  updateCategory: (
    id: string,
    patch: { label: string; prefix: string; notes: string },
  ) => { ok: true } | { ok: false; message: string };
  removeCategory: (id: string) => { ok: true } | { ok: false; message: string };
  bulkImportIssues: (
    rows: { line: number; categoryKey: string; itemName: string }[],
  ) => {
    imported: number;
    failed: { line: number; message: string }[];
  };
  /** 発行済み1件を削除（一覧・PDF画面など） */
  removeIssue: (codeId: string) => { ok: true } | { ok: false; message: string };
  /** 発行済みをすべて削除し、各カテゴリーの連番を先頭に戻す */
  clearAllIssues: () => void;
};

const LedgerContext = createContext<LedgerContextValue | null>(null);

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Persisted>(emptyPersisted);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(loadPersisted());
    setReady(true);
  }, []);

  const persist = useCallback((next: Persisted) => {
    setData(next);
    savePersisted(next);
  }, []);

  const issueCode = useCallback(
    (categoryId: string, itemName: string) => {
      const name = itemName.trim();
      if (!name) return { ok: false as const, message: "項目名を入力してください。" };
      const cat = data.categories.find((c) => c.id === categoryId);
      if (!cat) return { ok: false as const, message: "カテゴリーを選択してください。" };
      const current = data.nextSerialByPrefix[cat.prefix] ?? 1;
      if (current > 999) {
        return { ok: false as const, message: "このカテゴリーは連番が上限（999）に達しました。" };
      }
      const codeId = buildCodeId(cat.prefix, current);
      const row: IssuedRow = { codeId, itemName: name };
      const nextSerial = {
        ...data.nextSerialByPrefix,
        [cat.prefix]: current + 1,
      };
      persist({
        ...data,
        issues: [row, ...data.issues],
        nextSerialByPrefix: nextSerial,
      });
      return { ok: true as const };
    },
    [data, persist],
  );

  const addCategory = useCallback(
    (label: string, prefixInput: string, notesInput = "") => {
      const trimmed = label.trim();
      if (!trimmed) return { ok: false as const, message: "カテゴリー名を入力してください。" };
      const taken = new Set(data.categories.map((c) => c.prefix));
      let prefix = prefixInput.trim().toLowerCase();
      if (!prefix) {
        try {
          prefix = deriveUniquePrefixFromLabel(trimmed, taken);
        } catch (e) {
          return {
            ok: false as const,
            message: e instanceof Error ? e.message : "プレフィックス生成に失敗しました。",
          };
        }
      }
      if (!isValidPrefix(prefix)) {
        return {
          ok: false as const,
          message: "英小文字ちょうど5文字のプレフィックスを指定してください（空欄で自動割当）。",
        };
      }
      if (taken.has(prefix)) {
        return { ok: false as const, message: "そのプレフィックスは既に使われています。" };
      }
      const cat: Category = {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? `cat-${crypto.randomUUID()}`
            : `cat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        label: trimmed,
        prefix,
        notes: typeof notesInput === "string" ? notesInput.trim() : "",
      };
      persist({
        ...data,
        categories: [...data.categories, cat],
        nextSerialByPrefix: { ...data.nextSerialByPrefix, [prefix]: 1 },
      });
      return { ok: true as const, category: cat };
    },
    [data, persist],
  );

  const updateCategory = useCallback(
    (id: string, patch: { label: string; prefix: string; notes: string }) => {
      const label = patch.label.trim();
      const newPrefix = patch.prefix.trim().toLowerCase();
      const notes = typeof patch.notes === "string" ? patch.notes.trim() : "";
      if (!label) return { ok: false as const, message: "カテゴリー名を入力してください。" };
      if (!isValidPrefix(newPrefix)) {
        return { ok: false as const, message: "英小文字ちょうど5文字のプレフィックスにしてください。" };
      }
      const idx = data.categories.findIndex((c) => c.id === id);
      if (idx === -1) return { ok: false as const, message: "カテゴリーが見つかりません。" };
      const current = data.categories[idx];
      const otherPrefixes = new Set(
        data.categories.filter((c) => c.id !== id).map((c) => c.prefix),
      );
      if (otherPrefixes.has(newPrefix)) {
        return { ok: false as const, message: "そのプレフィックスは他のカテゴリーで使われています。" };
      }
      if (BUILTIN_PREFIXES.has(current.prefix) && newPrefix !== current.prefix) {
        return { ok: false as const, message: "組み込みカテゴリーのプレフィックスは変更できません。" };
      }
      if (current.prefix !== newPrefix) {
        const hasIssued = data.issues.some((row) => prefixFromCodeId(row.codeId) === current.prefix);
        if (hasIssued) {
          return {
            ok: false as const,
            message: "このカテゴリーでは既にコードを発行済みのため、プレフィックスは変更できません。",
          };
        }
      }
      const serial = data.nextSerialByPrefix[current.prefix] ?? 1;
      const nextSerial = { ...data.nextSerialByPrefix };
      if (current.prefix !== newPrefix) {
        delete nextSerial[current.prefix];
        nextSerial[newPrefix] = serial;
      }
      const nextCategories = [...data.categories];
      nextCategories[idx] = { ...current, label, prefix: newPrefix, notes };
      persist({
        ...data,
        categories: nextCategories,
        nextSerialByPrefix: nextSerial,
      });
      return { ok: true as const };
    },
    [data, persist],
  );

  const removeCategory = useCallback(
    (id: string) => {
      const cat = data.categories.find((c) => c.id === id);
      if (!cat) return { ok: false as const, message: "カテゴリーが見つかりません。" };
      if (BUILTIN_PREFIXES.has(cat.prefix)) {
        return { ok: false as const, message: "組み込みカテゴリーは削除できません。" };
      }
      const hasIssued = data.issues.some((row) => prefixFromCodeId(row.codeId) === cat.prefix);
      if (hasIssued) {
        return {
          ok: false as const,
          message: "このカテゴリーで発行済みのコードがあるため削除できません。",
        };
      }
      const nextCategories = data.categories.filter((c) => c.id !== id);
      const { [cat.prefix]: _r, ...restSerial } = data.nextSerialByPrefix;
      persist({
        ...data,
        categories: nextCategories,
        nextSerialByPrefix: restSerial,
      });
      return { ok: true as const };
    },
    [data, persist],
  );

  const removeIssue = useCallback(
    (codeId: string) => {
      const trimmed = codeId.trim();
      if (!trimmed) return { ok: false as const, message: "コードが指定されていません。" };
      const exists = data.issues.some((r) => r.codeId === trimmed);
      if (!exists) return { ok: false as const, message: "該当する発行がありません。" };
      const prefix = prefixFromCodeId(trimmed);
      if (!isValidPrefix(prefix)) {
        return { ok: false as const, message: "削除できないコード形式です。" };
      }
      const nextIssues = data.issues.filter((r) => r.codeId !== trimmed);
      let maxSerial = 0;
      for (const row of nextIssues) {
        if (prefixFromCodeId(row.codeId) !== prefix) continue;
        const s = serialFromCodeId(row.codeId);
        if (s != null) maxSerial = Math.max(maxSerial, s);
      }
      persist({
        ...data,
        issues: nextIssues,
        nextSerialByPrefix: {
          ...data.nextSerialByPrefix,
          [prefix]: maxSerial + 1,
        },
      });
      return { ok: true as const };
    },
    [data, persist],
  );

  const clearAllIssues = useCallback(() => {
    const nextSerialByPrefix = { ...data.nextSerialByPrefix };
    for (const c of data.categories) {
      nextSerialByPrefix[c.prefix] = 1;
    }
    persist({
      ...data,
      issues: [],
      nextSerialByPrefix,
    });
  }, [data, persist]);

  const bulkImportIssues = useCallback(
    (rows: { line: number; categoryKey: string; itemName: string }[]) => {
      const failed: { line: number; message: string }[] = [];
      const newRows: IssuedRow[] = [];
      let nextSerial = { ...data.nextSerialByPrefix };

      for (const r of rows) {
        const itemName = r.itemName.trim();
        if (!itemName) {
          failed.push({ line: r.line, message: "項目名が空です。" });
          continue;
        }
        const cat = matchCategoryByKey(r.categoryKey, data.categories);
        if (!cat) {
          failed.push({
            line: r.line,
            message: `カテゴリーが一致しません: 「${r.categoryKey.trim() || "（空）"}」`,
          });
          continue;
        }
        const current = nextSerial[cat.prefix] ?? 1;
        if (current > 999) {
          failed.push({
            line: r.line,
            message: `「${cat.label}」の連番が上限（999）に達しています。`,
          });
          continue;
        }
        const codeId = buildCodeId(cat.prefix, current);
        newRows.push({ codeId, itemName });
        nextSerial = { ...nextSerial, [cat.prefix]: current + 1 };
      }

      if (newRows.length > 0) {
        persist({
          ...data,
          issues: [...newRows, ...data.issues],
          nextSerialByPrefix: nextSerial,
        });
      }

      return { imported: newRows.length, failed };
    },
    [data, persist],
  );

  const value = useMemo(
    () => ({
      categories: data.categories,
      issues: data.issues,
      nextSerialByPrefix: data.nextSerialByPrefix,
      ready,
      issueCode,
      addCategory,
      updateCategory,
      removeCategory,
      bulkImportIssues,
      removeIssue,
      clearAllIssues,
    }),
    [
      data,
      ready,
      issueCode,
      addCategory,
      updateCategory,
      removeCategory,
      bulkImportIssues,
      removeIssue,
      clearAllIssues,
    ],
  );

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>;
}

export function useLedger() {
  const ctx = useContext(LedgerContext);
  if (!ctx) throw new Error("useLedger must be used within LedgerProvider");
  return ctx;
}
