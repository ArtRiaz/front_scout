"use client";

import { useRef, useState } from "react";
import { useFormStore } from "@/store/useFormStore";
import { StepLayout } from "@/components/layout/StepLayout";

const REQUIREMENTS = [
  { icon: "⏱", text: "3–5 minutes of highlights" },
  { icon: "📹", text: "Good video quality (720p or higher)" },
  { icon: "⚽", text: "Show your best skills and moves" },
  { icon: "🏟", text: "Real match or training footage" },
];

const MAX_SIZE_MB = 100;

export function Video() {
  const { videoFile, videoName, setVideoFile, setStep } = useFormStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setError("");

    const validTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Please upload MP4, MOV, AVI, or WebM file");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB`);
      return;
    }

    setVideoFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <StepLayout
      step={1}
      ctaLabel="Continue to Payment"
      ctaDisabled={!videoFile}
      onCta={() => setStep(2)}
    >
      <div className="space-y-5 pt-2">
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Upload Your Video
          </h2>
          <p className="text-base text-text-secondary leading-relaxed">
            Show us what you can do on the pitch. Upload a video of your best
            moments.
          </p>
        </section>

        {/* Requirements */}
        <section>
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-3">
            Video Requirements
          </h3>
          <div className="space-y-2">
            {REQUIREMENTS.map((req) => (
              <div
                key={req.text}
                className="flex items-center gap-3 bg-surface rounded-xl p-3.5 border border-border/50 shadow-sm"
              >
                <span className="text-lg flex-shrink-0">{req.icon}</span>
                <span className="text-sm text-text-primary">{req.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Upload Zone */}
        <section>
          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {!videoFile ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`w-full rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
                dragOver
                  ? "border-accent bg-accent/5"
                  : "border-border bg-surface hover:border-accent/50 hover:bg-accent/5"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <svg
                    className="h-7 w-7 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold text-text-primary">
                    Tap to upload video
                  </p>
                  <p className="text-sm text-text-tertiary mt-1">
                    MP4, MOV, AVI, WebM · max {MAX_SIZE_MB}MB
                  </p>
                </div>
              </div>
            </button>
          ) : (
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-success"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {videoName}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {formatSize(videoFile.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setVideoFile(null)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-text-tertiary hover:bg-surface-secondary hover:text-text-primary transition-colors"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-error mt-2">{error}</p>
          )}
        </section>
      </div>
    </StepLayout>
  );
}
