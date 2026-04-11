"use client";

import { t, type TranslationKey } from "@/lib/i18n";

const TRUST_KEYS: TranslationKey[] = [
  "trust.official",
  "trust.real_review",
  "trust.next_step",
];

function CheckBadge() {
  return (
    <span
      className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-club-red text-white shadow-sm"
      aria-hidden
    >
      <svg
        className="h-2.5 w-2.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 13l4 4L19 7"
        />
      </svg>
    </span>
  );
}

export function TrustCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-[0_4px_24px_-4px_rgba(17,24,39,0.12),0_2px_8px_-2px_rgba(17,24,39,0.08)]">
      <div className="h-px w-full bg-club-red" aria-hidden />
      <div className="px-3.5 py-3">
        <ul className="space-y-2">
          {TRUST_KEYS.map((key) => (
            <li key={key} className="flex items-center gap-2.5">
              <CheckBadge />
              <span className="text-[13px] font-medium leading-tight text-text-primary">
                {t(key)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
