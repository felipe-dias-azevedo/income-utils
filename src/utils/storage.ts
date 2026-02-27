export function saveStringToLocalStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore (e.g., SSR or disabled storage)
  }
}

export function loadStringFromLocalStorage(key: string, defaultValue?: string) {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return defaultValue ?? null;
    return v;
  } catch {
    return defaultValue ?? null;
  }
}

export function saveNumberToLocalStorage(key: string, value: number | null) {
  try {
    if (value === null) localStorage.setItem(key, "");
    else localStorage.setItem(key, String(value));
  } catch {
    // ignore
  }
}

export function loadNumberFromLocalStorage(
  key: string,
  defaultValue?: number | null
) {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return defaultValue ?? null;
    if (v === "") return defaultValue ?? null;
    const n = Number(v);
    return Number.isNaN(n) ? (defaultValue ?? null) : n;
  } catch {
    return defaultValue ?? null;
  }
}
