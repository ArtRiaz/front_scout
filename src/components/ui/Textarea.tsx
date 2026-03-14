"use client";

import { type TextareaHTMLAttributes } from "react";

interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  label: string;
  error?: string;
  optional?: boolean;
  onChange: (value: string) => void;
}

export function Textarea({
  label,
  error,
  optional,
  onChange,
  className = "",
  ...props
}: TextareaProps) {
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
      <textarea
        rows={3}
        className={`rounded-xl border bg-white px-4 py-3 text-base text-text-primary placeholder:text-text-tertiary outline-none transition-all duration-150 resize-none ${
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
