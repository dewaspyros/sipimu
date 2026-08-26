import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AsyncButtonProps extends ButtonProps {
  /** Menampilkan spinner, menonaktifkan tombol, dan menyetel aria-busy. */
  isLoading?: boolean;
  /** Teks pengganti saat loading. Default: teks children tetap dipakai. */
  loadingText?: string;
}

/**
 * Tombol dengan status async yang aksesibel.
 * Lebar tombol tetap stabil karena spinner menggantikan ikon, bukan menambah.
 */
export const AsyncButton = React.forwardRef<HTMLButtonElement, AsyncButtonProps>(
  ({ isLoading = false, loadingText, disabled, children, className, ...props }, ref) => (
    <Button
      ref={ref}
      aria-busy={isLoading || undefined}
      disabled={disabled || isLoading}
      className={cn(className)}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
      {isLoading && loadingText ? loadingText : children}
    </Button>
  )
);
AsyncButton.displayName = "AsyncButton";

export interface IconButtonProps extends Omit<ButtonProps, "size"> {
  /** Wajib: nama aksesibel untuk tombol yang hanya berisi ikon. */
  label: string;
  /** Tap target minimal 44px untuk mobile. */
  touchSafe?: boolean;
}

/** Tombol ikon yang selalu punya nama aksesibel + tooltip native. */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, touchSafe = true, className, children, ...props }, ref) => (
    <Button
      ref={ref}
      size="icon"
      aria-label={label}
      title={label}
      className={cn(touchSafe && "min-h-11 min-w-11 sm:min-h-9 sm:min-w-9", className)}
      {...props}
    >
      {children}
    </Button>
  )
);
IconButton.displayName = "IconButton";
