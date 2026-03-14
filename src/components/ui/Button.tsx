"use client";

import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  loading = false,
  fullWidth = true,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "relative flex items-center justify-center gap-2 font-semibold text-base transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

  const width = fullWidth ? "w-full" : "";

  const variants = {
    primary:
      "h-14 rounded-xl bg-brand text-white hover:bg-brand-light shadow-sm",
    secondary:
      "h-14 rounded-xl bg-white text-brand border border-border hover:bg-surface-secondary",
    ghost:
      "h-10 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${width} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="h-5 w-5 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
