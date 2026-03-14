"use client";

import type { ReactNode } from "react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import type { Step } from "@/types";

interface StepLayoutProps {
  step: Step;
  children: ReactNode;
  ctaLabel: string;
  ctaDisabled?: boolean;
  ctaLoading?: boolean;
  onCta: () => void;
}

export function StepLayout({
  step,
  children,
  ctaLabel,
  ctaDisabled,
  ctaLoading,
  onCta,
}: StepLayoutProps) {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-5 pt-4 pb-3">
        <ProgressBar current={step} />
      </header>

      <main className="flex-1 px-5 pb-28 step-enter">{children}</main>

      <div className="fixed bottom-0 inset-x-0 z-20 bg-background/80 backdrop-blur-md px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <Button
          onClick={onCta}
          disabled={ctaDisabled}
          loading={ctaLoading}
        >
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}
