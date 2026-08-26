import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState, ErrorState, LoadingState } from "./states";

export type SortDirection = "asc" | "desc";

export interface DataTableColumn<T> {
  /** Kunci unik kolom; juga dipakai sebagai state sort. */
  id: string;
  /** Judul kolom (teks atau node). */
  header: React.ReactNode;
  /** Renderer sel. */
  cell: (row: T, rowIndex: number) => React.ReactNode;
  /** Nilai untuk sorting. Bila diisi, kolom otomatis bisa di-sort. */
  sortValue?: (row: T) => string | number | null | undefined;
  align?: "left" | "center" | "right";
  /** Sembunyikan kolom di layar kecil (< md). */
  hideBelowMd?: boolean;
  className?: string;
  headerClassName?: string;
  /** Label aksesibel bila header berupa ikon saja. */
  srLabel?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  /** Kunci baris yang stabil — hindari index. */
  getRowId: (row: T, index: number) => string;
  /** Deskripsi tabel untuk screen reader (wajib untuk aksesibilitas). */
  caption: string;
  /** Tampilkan caption secara visual. Default: hanya screen reader. */
  showCaption?: boolean;
  isLoading?: boolean;
  /** Jumlah baris skeleton saat loading. */
  skeletonRows?: number;
  error?: unknown;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: React.ReactNode;
  emptyAction?: React.ReactNode;
  onRowClick?: (row: T) => void;
  /** Sorting terkontrol (opsional). Bila tidak diisi, tabel mengelola state sendiri. */
  sort?: { columnId: string; direction: SortDirection } | null;
  onSortChange?: (sort: { columnId: string; direction: SortDirection } | null) => void;
  /** Sort awal untuk mode tidak terkontrol. */
  defaultSort?: { columnId: string; direction: SortDirection } | null;
  className?: string;
  /** Kelas tambahan untuk wrapper scroll horizontal. */
  containerClassName?: string;
}

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

function compare(a: unknown, b: unknown) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "id-ID", { numeric: true, sensitivity: "base" });
}

/**
 * Tabel data generik: loading, empty, error, sorting, dan responsif —
 * dengan semantik tabel yang benar (`scope`, `aria-sort`, `caption`).
 */
export function DataTable<T>({
  data,
  columns,
  getRowId,
  caption,
  showCaption = false,
  isLoading = false,
  skeletonRows = 5,
  error,
  onRetry,
  emptyTitle = "Belum ada data",
  emptyDescription,
  emptyAction,
  onRowClick,
  sort,
  onSortChange,
  defaultSort = null,
  className,
  containerClassName,
}: DataTableProps<T>) {
  const [internalSort, setInternalSort] = React.useState(defaultSort);
  const activeSort = sort !== undefined ? sort : internalSort;

  const setSort = React.useCallback(
    (next: { columnId: string; direction: SortDirection } | null) => {
      if (sort === undefined) setInternalSort(next);
      onSortChange?.(next);
    },
    [sort, onSortChange]
  );

  const toggleSort = React.useCallback(
    (columnId: string) => {
      if (!activeSort || activeSort.columnId !== columnId) {
        setSort({ columnId, direction: "asc" });
      } else if (activeSort.direction === "asc") {
        setSort({ columnId, direction: "desc" });
      } else {
        setSort(null);
      }
    },
    [activeSort, setSort]
  );

  const sortedData = React.useMemo(() => {
    if (!activeSort) return data;
    const column = columns.find((c) => c.id === activeSort.columnId);
    if (!column?.sortValue) return data;
    const factor = activeSort.direction === "asc" ? 1 : -1;
    return [...data].sort((a, b) => compare(column.sortValue!(a), column.sortValue!(b)) * factor);
  }, [data, columns, activeSort]);

  const colCount = columns.length;

  return (
    <div className={cn("w-full overflow-x-auto", containerClassName)}>
      <table className={cn("w-full caption-bottom text-sm", className)}>
        <caption className={cn("py-2 text-sm text-muted-foreground", !showCaption && "sr-only")}>
          {caption}
        </caption>
        <thead>
          <tr className="border-b">
            {columns.map((column) => {
              const sortable = Boolean(column.sortValue);
              const isSorted = activeSort?.columnId === column.id;
              return (
                <th
                  key={column.id}
                  scope="col"
                  aria-sort={
                    sortable
                      ? isSorted
                        ? activeSort!.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                      : undefined
                  }
                  className={cn(
                    "whitespace-nowrap p-4 font-medium text-muted-foreground",
                    alignClass[column.align ?? "left"],
                    column.hideBelowMd && "hidden md:table-cell",
                    column.headerClassName
                  )}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.id)}
                      className="inline-flex items-center gap-1 rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <span>{column.header}</span>
                      {isSorted ? (
                        activeSort!.direction === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
                      )}
                      <span className="sr-only">
                        {isSorted
                          ? activeSort!.direction === "asc"
                            ? ", urut naik"
                            : ", urut turun"
                          : ", klik untuk mengurutkan"}
                      </span>
                    </button>
                  ) : column.srLabel ? (
                    <span className="sr-only">{column.srLabel}</span>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={colCount} className="p-4">
                <LoadingState variant="skeleton" rows={skeletonRows} label="Memuat data tabel..." />
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={colCount} className="p-0">
                <ErrorState onRetry={onRetry} />
              </td>
            </tr>
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="p-0">
                <EmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                  action={emptyAction}
                />
              </td>
            </tr>
          ) : (
            sortedData.map((row, index) => (
              <tr
                key={getRowId(row, index)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-b medical-transition hover:bg-muted/50",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      "p-4 align-middle",
                      alignClass[column.align ?? "left"],
                      column.hideBelowMd && "hidden md:table-cell",
                      column.className
                    )}
                  >
                    {column.cell(row, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
