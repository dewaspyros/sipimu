import * as React from "react";
import { AlertTriangle, Inbox, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  LoadingState                                                              */
/* -------------------------------------------------------------------------- */

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Teks yang dibacakan screen reader & ditampilkan di bawah spinner. */
  label?: string;
  /** `spinner` untuk area kecil, `skeleton` untuk placeholder konten. */
  variant?: "spinner" | "skeleton";
  /** Jumlah baris skeleton (hanya untuk variant `skeleton`). */
  rows?: number;
  /** Tinggi minimum area loading. */
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: "min-h-[80px]", md: "min-h-[180px]", lg: "min-h-[320px]" } as const;

export function LoadingState({
  label = "Memuat data...",
  variant = "spinner",
  rows = 4,
  size = "md",
  className,
  ...props
}: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-live="polite"
        className={cn("w-full space-y-3", className)}
        {...props}
      >
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3 py-8 text-muted-foreground",
        sizeMap[size],
        className
      )}
      {...props}
    >
      <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  EmptyState                                                                */
/* -------------------------------------------------------------------------- */

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: React.ReactNode;
  /** Ikon lucide (komponen), default `Inbox`. */
  icon?: React.ComponentType<{ className?: string }>;
  /** Aksi utama, mis. tombol "Tambah Data". */
  action?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  size = "md",
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3 px-6 py-10 text-center",
        sizeMap[size],
        className
      )}
      {...props}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="font-medium text-foreground">{title}</p>
        {description && (
          <p className="mx-auto max-w-md text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ErrorState                                                                */
/* -------------------------------------------------------------------------- */

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: React.ReactNode;
  /** Bila diisi, tombol "Coba Lagi" ditampilkan. */
  onRetry?: () => void;
  retryLabel?: string;
  size?: "sm" | "md" | "lg";
}

export function ErrorState({
  title = "Gagal memuat data",
  description = "Terjadi kesalahan saat mengambil data. Periksa koneksi Anda lalu coba lagi.",
  onRetry,
  retryLabel = "Coba Lagi",
  size = "md",
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3 px-6 py-10 text-center",
        sizeMap[size],
        className
      )}
      {...props}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="font-medium text-foreground">{title}</p>
        {description && (
          <p className="mx-auto max-w-md text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
