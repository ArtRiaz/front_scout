"use client";

import { type InputHTMLAttributes } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  error?: string;
  optional?: boolean;
  onChange: (value: string) => void;
}

export function Input({
  label,
  error,
  optional,
  onChange,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary">
        {label}
        {optional && (
          <span className="ml-1 text-text-tertiary font-normal">
            (optional)
          </span>
        )}
      </label>
      <input
        className={`h-12 rounded-xl border bg-white px-4 text-base text-text-primary placeholder:text-text-tertiary outline-none transition-all duration-150 ${
          error
            ? "border-error focus:ring-2 focus:ring-error/20"
            : "border-border focus:border-accent focus:ring-2 focus:ring-accent/10"
        } ${className}`}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
