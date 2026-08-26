import type { FilterOption } from "./filter-bar";

/** Nilai sentinel untuk opsi "semua" (Radix Select melarang value kosong). */
export const ALL_VALUE = "all";

export const MONTH_OPTIONS: FilterOption[] = [
  { value: ALL_VALUE, label: "Semua Bulan" },
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

export const WARD_NAMES = [
  "Perinatal",
  "Khadijah 2",
  "Khadijah 3",
  "Aisyah 3",
  "Hafshoh 3",
  "Hafshoh 4",
  "ICU",
  "Multazam",
] as const;

export const WARD_OPTIONS: FilterOption[] = [
  { value: ALL_VALUE, label: "Semua Bangsal" },
  ...WARD_NAMES.map((name) => ({ value: name, label: name })),
];
