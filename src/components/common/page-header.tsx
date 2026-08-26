import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description?: React.ReactNode;
  /** Ikon lucide yang tampil dalam chip biru di sisi kiri judul. */
  icon?: LucideIcon;
  /** Label kecil di atas judul (mis. nama modul). */
  eyebrow?: string;
  /** Tombol aksi di sisi kanan (desktop) / bawah judul (mobile). */
  actions?: React.ReactNode;
  /** Level heading. Gunakan h1 sekali per halaman. */
  as?: "h1" | "h2";
}

/** Header halaman yang konsisten: ikon, judul, deskripsi, dan slot aksi. */
export function PageHeader({
  title,
  description,
  icon: Icon,
  eyebrow,
  actions,
  as: Heading = "h1",
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <span className="icon-chip h-12 w-12 rounded-2xl" aria-hidden="true">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div className="space-y-1">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              {eyebrow}
            </p>
          )}
          <Heading className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </Heading>
          {description && (
            <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
