import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  FilterBar                                                                 */
/* -------------------------------------------------------------------------- */

export interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Label grup filter untuk screen reader. */
  label?: string;
}

/** Wadah responsif untuk sekumpulan filter. */
export function FilterBar({ label = "Filter data", className, children, ...props }: FilterBarProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  SelectFilter                                                              */
/* -------------------------------------------------------------------------- */

export interface FilterOption {
  value: string;
  label: string;
}

export interface SelectFilterProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  /** Lebar pada layar md ke atas, mis. `md:w-48`. */
  widthClassName?: string;
  disabled?: boolean;
  id?: string;
}

export function SelectFilter({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Pilih",
  widthClassName = "md:w-48",
  disabled,
  id,
}: SelectFilterProps) {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;

  return (
    <div className={cn("w-full", widthClassName)}>
      <Label htmlFor={fieldId} className="mb-2 block text-sm font-medium">
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={fieldId} aria-label={label} className="min-h-10">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  SearchFilter                                                              */
/* -------------------------------------------------------------------------- */

export interface SearchFilterProps {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  widthClassName?: string;
  id?: string;
}

export function SearchFilter({
  label = "Cari Data",
  value,
  onValueChange,
  placeholder = "Ketik kata kunci",
  widthClassName = "md:w-64",
  id,
}: SearchFilterProps) {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;

  return (
    <div className={cn("w-full", widthClassName)}>
      <Label htmlFor={fieldId} className="mb-2 block text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id={fieldId}
          type="search"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onValueChange(e.target.value)}
          className="min-h-10 pl-10 placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
