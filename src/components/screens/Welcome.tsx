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
      {/* Hero / branded header */}
      <header className="relative w-full overflow-hidden bg-surface shadow-[0_1px_0_0_var(--color-border)]">
        <div className="h-1 w-full bg-club-red" aria-hidden />
        <div className="px-6 pb-7 pt-8">
          <div className="mx-auto flex max-w-sm flex-col items-center text-center">
            <div className="relative mb-6">
              <div
                className="absolute -inset-1 rounded-full bg-club-red-subtle ring-1 ring-club-red/20"
                aria-hidden
              />
              <Image
                src="/logo.jpg"
                alt="FC Real Pharma"
                width={92}
                height={92}
                className="relative rounded-full border-2 border-surface shadow-sm"
                priority
              />
            </div>

            <h1 className="text-[1.35rem] font-extrabold leading-tight tracking-tight text-text-primary sm:text-2xl">
              FC Real Pharma (Ukraine)
            </h1>

            <div className="mt-3 inline-flex flex-col items-center">
              <span className="text-base font-bold text-text-primary">
                Official Player Screening
              </span>
              <span
                className="mt-1.5 h-0.5 w-12 rounded-full bg-club-red"
                aria-hidden
              />
            </div>

            <p className="mt-4 inline-flex flex-wrap items-center justify-center gap-x-1 rounded-full border border-club-red/25 bg-club-red-subtle px-3.5 py-1.5 text-xs font-medium text-club-red-dark">
              <span>Professional club</span>
              <span className="text-club-red/60" aria-hidden>
                |
              </span>
              <span>Ukrainian Second Division</span>
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-6 pt-6 step-enter">
        <TrustCard />

        <p className="mt-5 text-center text-[0.9375rem] leading-relaxed text-text-secondary">
          Upload your profile and video for official review.
        </p>

        {/* subtle rhythm line */}
        <div
          className="mx-auto mt-6 flex w-16 items-center gap-1"
          aria-hidden
        >
          <span className="h-px flex-1 rounded-full bg-club-red/25" />
          <span className="h-1 w-1 shrink-0 rounded-full bg-club-red/50" />
          <span className="h-px flex-1 rounded-full bg-club-red/25" />
        </div>
      </main>

      <div className="mt-auto px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">
        <Button onClick={onStart} className="shadow-md shadow-brand/10">
          Start as a Player
        </Button>
      </div>
    </div>
  );
}
