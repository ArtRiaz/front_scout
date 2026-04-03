"use client";

import { useEffect, useState } from "react";
import { useFormStore } from "@/store/useFormStore";
import { initTelegram, getWebApp, getTelegramUserId } from "@/lib/telegram";
import { getStatus } from "@/lib/api";
import { Registration } from "@/components/screens/Registration";
import { Video } from "@/components/screens/Video";
import { Payment } from "@/components/screens/Payment";

function FlowCompleteScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-5">
      <div className="step-enter flex flex-col items-center text-center">
        <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
          <svg
            className="h-10 w-10 text-success"
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
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          You&apos;re All Set!
        </h2>
        <p className="text-base text-text-secondary max-w-xs leading-relaxed">
          Your application has been submitted. Our team will review your profile
          and video, and get back to you within 48 hours.
        </p>
        <p className="text-sm text-text-tertiary mt-6">
          You can close this window now.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const {
    step,
    setStep,
    setStagedVideo,
    setApplicationComplete,
    applicationComplete,
  } = useFormStore();
  const [hydrated, setHydrated] = useState(false);
  const [statusLoadError, setStatusLoadError] = useState<string | null>(null);

  useEffect(() => {
    initTelegram();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const tgId = getTelegramUserId();
      if (!tgId) {
        if (!cancelled) setHydrated(true);
        return;
      }
      setStatusLoadError(null);
      try {
        const s = await getStatus(tgId);
        if (cancelled) return;

        if (!s.has_registration) {
          setStep(0);
          setApplicationComplete(false);
        } else if (s.status === "video_uploaded" && s.has_payment) {
          setApplicationComplete(true);
        } else if (s.staged_video_id) {
          setStagedVideo(String(s.staged_video_id), "Your video");
          setApplicationComplete(false);
          setStep(2);
        } else {
          setApplicationComplete(false);
          setStep(1);
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Request failed";
          console.error("[scout] getStatus failed:", e);
          setStatusLoadError(msg);
          setHydrated(true);
        }
        return;
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [setStep, setStagedVideo, setApplicationComplete]);

  useEffect(() => {
    const webapp = getWebApp();
    if (!webapp) return;

    if (applicationComplete) {
      webapp.BackButton.hide();
      return;
    }

    if (step > 0) {
      webapp.BackButton.show();
      const handleBack = () => setStep((step - 1) as 0 | 1);
      webapp.BackButton.onClick(handleBack);
      return () => {
        webapp.BackButton.offClick(handleBack);
      };
    } else {
      webapp.BackButton.hide();
    }
  }, [step, setStep, applicationComplete]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (statusLoadError && getTelegramUserId()) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-base font-medium text-text-primary max-w-sm">
          Couldn&apos;t load your application status. Check your connection and
          try again.
        </p>
        <p className="text-xs text-text-tertiary max-w-sm break-words">
          {statusLoadError}
        </p>
        <p className="text-xs text-text-tertiary max-w-sm">
          If this keeps happening, the app URL may be missing the API address:
          set{" "}
          <code className="rounded bg-black/10 px-1">API_PROXY_ORIGIN</code> on
          Vercel or open the mini app with{" "}
          <code className="rounded bg-black/10 px-1">?api=</code> pointing to
          your backend.
        </p>
        <button
          type="button"
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (applicationComplete) {
    return <FlowCompleteScreen />;
  }

  switch (step) {
    case 0:
      return <Registration />;
    case 1:
      return <Video />;
    case 2:
      return <Payment />;
    default:
      return <Registration />;
  }
}
