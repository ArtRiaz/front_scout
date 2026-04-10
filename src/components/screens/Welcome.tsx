"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";

interface WelcomeProps {
  onStart: () => void;
}

export function Welcome({ onStart }: WelcomeProps) {

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-10 step-enter">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logo.jpg"
            alt="FC Real Pharma"
            width={88}
            height={88}
            className="rounded-full border-2 border-border/60 shadow-sm"
            priority
          />
        </div>

        {/* Title block */}
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary leading-tight">
            FC Real Pharma (Ukraine)
          </h1>
          <p className="mt-1.5 text-base font-semibold text-accent">
            Official Player Screening
          </p>
          <p className="mt-1 text-sm text-text-tertiary">
            Professional club &nbsp;|&nbsp; Ukrainian Second Division
          </p>

          {/* Divider */}
          <div className="mx-auto mt-6 mb-6 h-px w-16 bg-border" />

          <p className="text-base text-text-secondary leading-relaxed">
            Upload your profile and video for official review.
          </p>
        </div>
      </main>

      {/* CTA pinned to bottom */}
      <div className="px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <Button onClick={onStart}>
          Start as a Player
        </Button>
      </div>
    </div>
  );
}
