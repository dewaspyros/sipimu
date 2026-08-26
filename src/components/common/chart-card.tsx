import * as React from "react";
import { BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EmptyState, ErrorState, LoadingState } from "./states";

export interface ChartCardProps {
  title: string;
  description?: React.ReactNode;
  /** Kontrol filter di sisi kanan header. */
  toolbar?: React.ReactNode;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  /** Tampilkan empty state alih-alih chart. */
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: React.ReactNode;
  /** Tinggi area chart (px) — dipakai juga oleh placeholder agar layout stabil. */
  height?: number;
  className?: string;
  children: React.ReactNode;
}

/**
 * Pembungkus chart dengan header, toolbar filter, serta
 * loading/empty/error state yang tidak menggeser layout.
 */
export function ChartCard({
  title,
  description,
  toolbar,
  isLoading = false,
  error,
  onRetry,
  isEmpty = false,
  emptyTitle = "Belum ada data untuk ditampilkan",
  emptyDescription = "Coba ubah filter tahun atau diagnosis.",
  height = 400,
  className,
  children,
}: ChartCardProps) {
  return (
    <Card className={cn("medical-card", className)}>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {toolbar && (
            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
              {toolbar}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ minHeight: height }} className="flex w-full flex-col justify-center">
          {isLoading ? (
            <LoadingState label={`Memuat ${title.toLowerCase()}...`} size="lg" />
          ) : error ? (
            <ErrorState onRetry={onRetry} size="lg" />
          ) : isEmpty ? (
            <EmptyState
              icon={BarChart3}
              title={emptyTitle}
              description={emptyDescription}
              size="lg"
            />
          ) : (
            children
          )}
        </div>
      </CardContent>
    </Card>
  );
}
