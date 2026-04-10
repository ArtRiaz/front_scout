"use client";

const TRUST_POINTS = [
  "Official club process",
  "Real club review",
  "Next step for selected players",
] as const;

function TrustIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.25}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export function TrustCard() {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
      <div className="h-0.5 w-full bg-club-red" aria-hidden />
      <div className="border-l-[3px] border-l-club-red px-4 py-4">
        <ul className="space-y-3.5">
          {TRUST_POINTS.map((title) => (
            <li key={title} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-club-red-subtle text-club-red">
                <TrustIcon />
              </span>
              <span className="text-sm font-medium leading-snug text-text-primary pt-0.5">
                {title}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
