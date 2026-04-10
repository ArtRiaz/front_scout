"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { TrustCard } from "@/components/ui/TrustCard";

interface WelcomeProps {
  onStart: () => void;
}

export function Welcome({ onStart }: WelcomeProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="relative w-full overflow-hidden bg-surface shadow-[0_1px_0_0_var(--color-border)]">
        <div className="h-1 w-full bg-club-red" aria-hidden />
        <div className="px-6 pb-6 pt-7">
          <div className="mx-auto flex max-w-sm flex-col items-center text-center">
            <div className="mb-5">
              <Image
                src="/logo.jpg"
                alt="FC Real Pharma"
                width={72}
                height={72}
                className="rounded-full border border-border/90 shadow-[0_2px_8px_rgba(17,24,39,0.08)] ring-1 ring-black/[0.04]"
                priority
              />
            </div>

            <h1 className="text-[1.25rem] font-extrabold leading-[1.2] tracking-[-0.02em] text-[#0B0F14] sm:text-[1.35rem]">
              FC Real Pharma (Ukraine)
            </h1>

            <p className="mt-2 text-[0.9375rem] font-bold leading-tight text-club-red">
              Official Player Screening
            </p>

            <p className="mt-2.5 text-xs font-medium leading-snug text-text-tertiary">
              Professional club&nbsp;&nbsp;|&nbsp;&nbsp;Ukrainian Second Division
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-4 pt-5 step-enter">
        <TrustCard />

        <p className="mt-4 text-center text-[0.9375rem] leading-snug text-text-secondary">
          Upload your profile and video for official review.
        </p>
      </main>

      <div className="mt-auto px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1">
        <Button onClick={onStart} className="welcome-cta">
          Start as a Player
        </Button>
      </div>
    </div>
  );
}
