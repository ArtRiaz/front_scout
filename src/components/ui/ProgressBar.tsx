"use client";

import { STEPS, type Step } from "@/types";

interface ProgressBarProps {
  current: Step;
}

export function ProgressBar({ current }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-1 mb-2">
        {STEPS.map((s, i) => (
          <div key={s.number} className="flex items-center flex-1 last:flex-initial">
            <div className="flex-1 h-1 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  i <= current ? "bg-accent" : "bg-border"
                }`}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-text-tertiary">
        Step {current + 1} of {STEPS.length}
        <span className="mx-1.5">·</span>
        <span className="text-text-secondary font-medium">
          {STEPS[current].label}
        </span>
      </p>
    </div>
  );
}
