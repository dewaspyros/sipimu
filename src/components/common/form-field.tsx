import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FieldProps {
  label: string;
  /** Id kontrol. Bila kosong, dibuat otomatis via useId. */
  id?: string;
  description?: React.ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  /** Render-prop: terima props aksesibilitas untuk dipasang pada kontrol. */
  children: (props: {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
    required?: boolean;
  }) => React.ReactNode;
}

/**
 * Pembungkus field form yang menautkan label, deskripsi, dan pesan error
 * ke kontrol lewat `aria-describedby` / `aria-invalid`.
 */
export function Field({
  label,
  id,
  description,
  error,
  required,
  className,
  children,
}: FieldProps) {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={fieldId} className={cn(error && "text-destructive")}>
        {label}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      {children({
        id: fieldId,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        required,
      })}
      {description && (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
