"use client";

import { useState } from "react";
import { useFormStore } from "@/store/useFormStore";
import { StepLayout } from "@/components/layout/StepLayout";
import { getTelegramUserId, getWebApp } from "@/lib/telegram";
import { getStatus, initiatePayment, submitVideo, trackEvent } from "@/lib/api";

const BENEFITS = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
      </svg>
    ),
    title: "Profile Review",
    desc: "Your registration data reviewed by our scouts",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
      </svg>
    ),
    title: "Video Analysis",
    desc: "Professional evaluation of your footage",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    title: "Expert Feedback",
    desc: "Detailed feedback on your strengths and areas to improve",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Eligibility Decision",
    desc: "Clear decision on your next stage qualification",
  },
];

export function Payment() {
  const { stagedVideoId, isSubmitting, setSubmitting } = useFormStore();
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    try {
      setError("");

      if (!stagedVideoId) {
        setError("Please upload your video first.");
        return;
      }

      const tgId = getTelegramUserId();
      if (!tgId) {
        setError("Open this mini app from Telegram to continue.");
        return;
      }

      setSubmitting(true);

      // 1) Create invoice (Stars) and open invoice UI in Telegram.
      const payment = await initiatePayment(tgId);

      const webapp = getWebApp();
      if (!webapp?.openInvoice) {
        setError("Telegram invoice UI is not available.");
        return;
      }

      await trackEvent(tgId, "invoice_opened", {
        invoice_payload: payment.invoice_payload,
      });

      webapp.openInvoice(payment.invoice_link);

      // 2) Poll backend until we receive `successful_payment`.
      const startedAt = Date.now();
      const timeoutMs = 180_000; // 3 minutes

      // eslint-disable-next-line no-constant-condition
      while (Date.now() - startedAt < timeoutMs) {
        const status = await getStatus(tgId);
        if (status.has_payment) break;
        await new Promise((r) => setTimeout(r, 2000));
      }

      const status = await getStatus(tgId);
      if (!status.has_payment) {
        setError(
          "Payment not confirmed yet. If you don't have Stars, you can buy them with @PremiumBot."
        );
        return;
      }

      // 3) Finalize video only after payment is confirmed.
      await submitVideo(tgId, stagedVideoId);

      setDone(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
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
            Your application has been submitted. Our team will review your
            profile and video, and get back to you within 48 hours.
          </p>
          <p className="text-sm text-text-tertiary mt-6">
            You can close this window now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <StepLayout
      step={2}
      ctaLabel="Pay 1 Star"
      ctaLoading={isSubmitting}
      ctaDisabled={!stagedVideoId}
      onCta={handlePay}
    >
      <div className="space-y-5 pt-2">
        {error && (
          <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3">
            <p className="text-sm text-error">{error}</p>
            <a
              href="https://t.me/PremiumBot"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex h-10 items-center justify-center rounded-lg bg-accent/10 px-3 text-sm font-semibold text-accent hover:bg-accent/15 transition-colors"
            >
              Buy Stars with @PremiumBot
            </a>
          </div>
        )}

        <section className="text-center pt-2">
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Basic Trial
          </h2>
          <p className="text-lg text-text-secondary">
            Eligibility Review
          </p>
        </section>

        {/* Offer Card */}
        <section>
          <div className="relative overflow-hidden rounded-2xl bg-surface border border-border shadow-md">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent to-accent-light" />

            <div className="p-5 space-y-4">
              <p className="text-sm text-text-secondary">
                Get your profile and video evaluated by professional scouts.
                Receive actionable feedback and a clear decision on your next
                step.
              </p>

              <div className="space-y-3">
                {BENEFITS.map((b) => (
                  <div key={b.title} className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      {b.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {b.title}
                      </p>
                      <p className="text-xs text-text-secondary leading-snug">
                        {b.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="border-t border-border bg-surface-secondary px-5 py-4">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-text-primary">1</span>
                <span className="text-base text-text-tertiary">
                  Stars
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="flex flex-col items-center gap-2 text-center pb-2">
          <div className="flex items-center gap-1.5 text-text-tertiary">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            <span className="text-sm">Secure payment</span>
          </div>
          <p className="text-xs text-text-tertiary max-w-[260px] leading-relaxed">
            Your payment is processed securely. You&apos;ll receive confirmation
            via Telegram after successful payment.
          </p>
        </section>
      </div>
    </StepLayout>
  );
}
