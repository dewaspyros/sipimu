import { useEffect, useState } from "react";

/**
 * State yang tersimpan di sessionStorage — bertahan saat pindah tab / refresh,
 * hilang otomatis saat tab/browser ditutup.
 */
export function usePersistedState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage penuh/ditolak — abaikan, state tetap jalan di memori
    }
  }, [key, value]);

  return [value, setValue] as const;
}
