"use client";

import Image from "next/image";

export function ClubBadge() {
  return (
    <div className="flex items-center gap-2.5 py-1">
      <Image
        src="/logo.jpg"
        alt="FC Real Pharma"
        width={36}
        height={36}
        className="rounded-full border border-border/50"
      />
      <div className="leading-tight">
        <p className="text-sm font-semibold text-text-primary">FC Real Pharma</p>
        <p className="text-xs text-text-tertiary">Official Player Screening</p>
      </div>
    </div>
  );
}
