import { proposeUniquePrefix } from "@/lib/code-system";

/** 文字列から決定的に英小文字のみを生成（長さ固定） */
function lettersFromSeed(seed: string, length: number): string {
  const enc = new TextEncoder().encode(seed);
  let state = 2166136261;
  for (let i = 0; i < enc.length; i++) {
    state ^= enc[i];
    state = Math.imul(state, 16777619);
  }
  let out = "";
  for (let i = 0; i < length; i++) {
    state = Math.imul(state ^ (state >>> 13), 1274126177);
    state ^= enc[i % Math.max(enc.length, 1)] ?? 0;
    out += String.fromCharCode(97 + ((state >>> (i % 5)) % 26));
  }
  return out.slice(0, length);
}

/**
 * カテゴリー名から英小文字5文字のプレフィックス候補を作り、
 * `taken` に無いものを返す。
 * - ラテン文字が十分ある場合は先頭から最大5文字を優先
 * - 日本語のみ等はシード付きハッシュで一意性の出やすい5文字にする
 */
export function deriveUniquePrefixFromLabel(label: string, taken: Set<string>): string {
  const normalized = label.normalize("NFKC").trim().toLowerCase();
  if (!normalized) {
    return proposeUniquePrefix(taken);
  }

  const latinOnly = normalized.replace(/[^a-z]/g, "");

  let base: string;
  if (latinOnly.length >= 5) {
    base = latinOnly.slice(0, 5);
  } else if (latinOnly.length > 0) {
    const need = 5 - latinOnly.length;
    base = (latinOnly + lettersFromSeed(normalized, need)).slice(0, 5);
  } else {
    base = lettersFromSeed(normalized, 5);
  }

  if (/^[a-z]{5}$/.test(base) && !taken.has(base)) {
    return base;
  }

  for (let salt = 1; salt < 10000; salt++) {
    const candidate = lettersFromSeed(`${normalized}\0${salt}`, 5);
    if (!taken.has(candidate)) {
      return candidate;
    }
  }

  return proposeUniquePrefix(taken);
}
