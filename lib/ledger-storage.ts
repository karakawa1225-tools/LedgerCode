import {
  DEFAULT_CATEGORIES,
  type Category,
  type IssuedRow,
  isValidPrefix,
} from "@/lib/code-system";

export const STORAGE_KEY = "ledgercode:v1";

export type Persisted = {
  categories: Category[];
  issues: IssuedRow[];
  nextSerialByPrefix: Record<string, number>;
};

export function emptyPersisted(): Persisted {
  const nextSerialByPrefix: Record<string, number> = {};
  for (const c of DEFAULT_CATEGORIES) {
    nextSerialByPrefix[c.prefix] = 1;
  }
  return {
    categories: [...DEFAULT_CATEGORIES],
    issues: [],
    nextSerialByPrefix,
  };
}

function normalizeCategory(c: {
  id: string;
  label: string;
  prefix: string;
  notes?: string;
}): Category {
  return {
    id: c.id,
    label: c.label,
    prefix: c.prefix,
    notes: typeof c.notes === "string" ? c.notes : "",
  };
}

export function mergeCategories(fromStorage: Category[]): Category[] {
  const valid = fromStorage.filter(
    (c) =>
      c &&
      typeof c.id === "string" &&
      typeof c.label === "string" &&
      typeof c.prefix === "string" &&
      isValidPrefix(c.prefix),
  );
  const byPrefix = new Map(valid.map((c) => [c.prefix, normalizeCategory(c)]));
  for (const d of DEFAULT_CATEGORIES) {
    if (!byPrefix.has(d.prefix)) {
      byPrefix.set(d.prefix, d);
    }
  }
  return Array.from(byPrefix.values());
}

export function loadPersisted(): Persisted {
  if (typeof window === "undefined") return emptyPersisted();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyPersisted();
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    const base = emptyPersisted();
    const categories =
      Array.isArray(parsed.categories) && parsed.categories.length > 0
        ? mergeCategories(parsed.categories)
        : base.categories;
    const issues = Array.isArray(parsed.issues) ? parsed.issues : [];
    const nextSerialByPrefix = {
      ...base.nextSerialByPrefix,
      ...(parsed.nextSerialByPrefix && typeof parsed.nextSerialByPrefix === "object"
        ? parsed.nextSerialByPrefix
        : {}),
    };
    for (const c of categories) {
      if (nextSerialByPrefix[c.prefix] == null) {
        nextSerialByPrefix[c.prefix] = 1;
      }
    }
    return { categories, issues, nextSerialByPrefix };
  } catch {
    return emptyPersisted();
  }
}

export function savePersisted(data: Persisted) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** 発行コード先頭5文字をプレフィックスとして扱う */
export function prefixFromCodeId(codeId: string): string {
  return codeId.length >= 5 ? codeId.slice(0, 5) : "";
}
