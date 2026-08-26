/**
 * Pembatas percobaan login per-perangkat.
 * Setelah MAX_ATTEMPTS kegagalan berturut-turut untuk satu NIK,
 * login dikunci selama LOCK_DURATION_MS.
 */

export const MAX_ATTEMPTS = 3;
export const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 menit

const STORAGE_KEY = 'sipimu_login_attempts';

interface AttemptRecord {
  count: number;
  lockedUntil: number | null;
}

type AttemptMap = Record<string, AttemptRecord>;

const normalize = (nik: string) => nik.trim().toLowerCase();

const readAll = (): AttemptMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as AttemptMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeAll = (map: AttemptMap) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* storage tidak tersedia — abaikan */
  }
};

export interface LockStatus {
  locked: boolean;
  /** Sisa waktu kunci dalam milidetik. */
  remainingMs: number;
  /** Sisa percobaan sebelum terkunci. */
  attemptsLeft: number;
}

export const getLockStatus = (nik: string): LockStatus => {
  const key = normalize(nik);
  if (!key) return { locked: false, remainingMs: 0, attemptsLeft: MAX_ATTEMPTS };

  const map = readAll();
  const record = map[key];
  if (!record) return { locked: false, remainingMs: 0, attemptsLeft: MAX_ATTEMPTS };

  const now = Date.now();
  if (record.lockedUntil && record.lockedUntil > now) {
    return { locked: true, remainingMs: record.lockedUntil - now, attemptsLeft: 0 };
  }

  // Kunci sudah kedaluwarsa → reset penghitung.
  if (record.lockedUntil && record.lockedUntil <= now) {
    delete map[key];
    writeAll(map);
    return { locked: false, remainingMs: 0, attemptsLeft: MAX_ATTEMPTS };
  }

  return {
    locked: false,
    remainingMs: 0,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - record.count),
  };
};

/** Catat satu kegagalan login, kembalikan status terbaru. */
export const registerFailedAttempt = (nik: string): LockStatus => {
  const key = normalize(nik);
  if (!key) return { locked: false, remainingMs: 0, attemptsLeft: MAX_ATTEMPTS };

  const map = readAll();
  const current = map[key];
  const count = (current && (!current.lockedUntil || current.lockedUntil > Date.now()) ? current.count : 0) + 1;

  if (count >= MAX_ATTEMPTS) {
    const lockedUntil = Date.now() + LOCK_DURATION_MS;
    map[key] = { count, lockedUntil };
    writeAll(map);
    return { locked: true, remainingMs: LOCK_DURATION_MS, attemptsLeft: 0 };
  }

  map[key] = { count, lockedUntil: null };
  writeAll(map);
  return { locked: false, remainingMs: 0, attemptsLeft: MAX_ATTEMPTS - count };
};

/** Bersihkan penghitung setelah login berhasil. */
export const clearAttempts = (nik: string) => {
  const key = normalize(nik);
  if (!key) return;
  const map = readAll();
  if (map[key]) {
    delete map[key];
    writeAll(map);
  }
};

/** Format sisa waktu menjadi m:ss. */
export const formatRemaining = (ms: number) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
