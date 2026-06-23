// Year cutoff: data dengan tanggal masuk >= 2026 memakai nama baru
// (Intracranial Hemorrhagia & Post Partum Hemorrhagia).
// Data sebelum 2026 tetap memakai nama lama (Pneumonia & Dengue Fever).
export const PATHWAY_RENAME_YEAR = 2026;

const COMMON_PATHWAYS = [
  "Sectio Caesaria",
  "Stroke Hemoragik",
  "Stroke Non Hemoragik",
] as const;

const LEGACY_PATHWAYS = ["Pneumonia", "Dengue Fever"] as const;
const NEW_PATHWAYS = ["Intracranial Hemorrhagia", "Post Partum Hemorrhagia"] as const;

export type PathwayOption = { value: string; label: string };

/**
 * Mengembalikan daftar opsi Clinical Pathway sesuai tahun terpilih.
 * - year "all" / undefined → tampilkan semua (lama + baru) untuk filter global
 * - year < 2026 → tampilkan nama lama
 * - year >= 2026 → tampilkan nama baru
 */
export const getPathwayOptions = (
  year?: string | number,
  options: { includeAll?: boolean } = {}
): PathwayOption[] => {
  const { includeAll = false } = options;
  const yearNum =
    year === undefined || year === "all" || year === ""
      ? null
      : typeof year === "number"
      ? year
      : parseInt(year, 10);

  let pathways: string[];
  if (yearNum === null || Number.isNaN(yearNum)) {
    pathways = [...COMMON_PATHWAYS, ...LEGACY_PATHWAYS, ...NEW_PATHWAYS];
  } else if (yearNum < PATHWAY_RENAME_YEAR) {
    pathways = [...COMMON_PATHWAYS, ...LEGACY_PATHWAYS];
  } else {
    pathways = [...COMMON_PATHWAYS, ...NEW_PATHWAYS];
  }

  const result = pathways.map((p) => ({ value: p, label: p }));
  if (includeAll) {
    return [{ value: "all", label: "Semua Clinical Pathway" }, ...result];
  }
  return result;
};

/**
 * Mengembalikan nama Clinical Pathway sesuai tahun.
 * Berguna ketika user membuat data baru: 2026+ → nama baru, sebelumnya → nama lama.
 */
export const mapPathwayNameByYear = (name: string, year: number): string => {
  if (year >= PATHWAY_RENAME_YEAR) {
    if (name === "Pneumonia") return "Intracranial Hemorrhagia";
    if (name === "Dengue Fever") return "Post Partum Hemorrhagia";
  } else {
    if (name === "Intracranial Hemorrhagia") return "Pneumonia";
    if (name === "Post Partum Hemorrhagia") return "Dengue Fever";
  }
  return name;
};
