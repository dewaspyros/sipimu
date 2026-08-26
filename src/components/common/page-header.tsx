import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description?: React.ReactNode;
  /** Tombol aksi di sisi kanan (desktop) / bawah judul (mobile). */
  actions?: React.ReactNode;
  /** Level heading. Gunakan h1 sekali per halaman. */
  as?: "h1" | "h2";
}

/** Header halaman yang konsisten: satu judul, deskripsi, dan slot aksi. */
export function PageHeader({
  title,
  description,
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
      <div className="space-y-1">
        <Heading className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </Heading>
        {description && (
          <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
