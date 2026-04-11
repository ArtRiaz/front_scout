"use client";

import { STEPS, type Step } from "@/types";
import { t, type TranslationKey } from "@/lib/i18n";

const STEP_LABEL_KEYS: TranslationKey[] = [
  "step.registration",
  "step.video",
  "step.payment",
];

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
        {t("step.of", { current: current + 1, total: STEPS.length })}
        <span className="mx-1.5">·</span>
        <span className="text-text-secondary font-medium">
          {t(STEP_LABEL_KEYS[current])}
        </span>
      </p>
    </div>
  );
}
