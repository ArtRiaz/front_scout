"use client";

import { useEffect, useState } from "react";
import { useFormStore } from "@/store/useFormStore";
import { StepLayout } from "@/components/layout/StepLayout";
import { getTelegramUserId, getWebApp } from "@/lib/telegram";
import {
  getPaymentInfo,
  getStatus,
  initiatePayment,
  submitVideo,
  trackEvent,
} from "@/lib/api";
import { ClubBadge } from "@/components/ui/ClubBadge";
import { t } from "@/lib/i18n";

function defaultStarsForDisplay(): number {
  const raw = process.env.NEXT_PUBLIC_PAYMENT_STARS;
  if (raw != null && String(raw).trim() !== "") {
    const n = Math.round(Number(raw));
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 100;
}

function benefitsData() {
  return [
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
        </svg>
      ),
      title: t("pay.benefit_profile"),
      desc: t("pay.benefit_profile_desc"),
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
        </svg>
      ),
      title: t("pay.benefit_video"),
      desc: t("pay.benefit_video_desc"),
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t("pay.benefit_decision"),
      desc: t("pay.benefit_decision_desc"),
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      title: t("pay.benefit_submission"),
      desc: t("pay.benefit_submission_desc"),
    },
  ];
}

export function Payment() {
  const {
    stagedVideoId,
    isSubmitting,
    setSubmitting,
    setApplicationComplete,
  } = useFormStore();
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [starsAmount, setStarsAmount] = useState<number>(() => defaultStarsForDisplay());

  useEffect(() => {
    getPaymentInfo()
      .then((info) => {
        const n = Math.round(Number(info.amount));
        if (Number.isFinite(n) && n > 0) setStarsAmount(n);
      })
      .catch(() => {});
  }, []);

  const handlePay = async () => {
    try {
      setError("");

      if (!stagedVideoId) {
        setError(t("pay.upload_first"));
        return;
      }

      const tgId = getTelegramUserId();
      if (!tgId) {
        setError(t("pay.open_from_tg"));
        return;
      }

      setSubmitting(true);

      const payment = await initiatePayment(tgId);
      const invoiceLink = String(payment.invoice_link || "").trim();

      const webapp = getWebApp();
      if (!webapp?.openInvoice) {
        setError(t("pay.invoice_unavailable"));
        return;
      }
      if (!invoiceLink) {
        setError(t("pay.invoice_missing"));
        return;
      }

      try {
        const parsed = new URL(invoiceLink);
        if (parsed.protocol !== "https:") {
          setError(t("pay.invoice_invalid_protocol"));
          return;
        }
      } catch {
        setError(t("pay.invoice_invalid_format"));
        return;
      }

      await trackEvent(tgId, "invoice_opened", {
        invoice_payload: payment.invoice_payload,
      });

      try {
        webapp.openInvoice(invoiceLink);
      } catch {
        window.open(invoiceLink, "_blank", "noopener,noreferrer");
      }

      const startedAt = Date.now();
      const timeoutMs = 180_000;

      // eslint-disable-next-line no-constant-condition
      while (Date.now() - startedAt < timeoutMs) {
        const status = await getStatus(tgId);
        if (status.has_payment) break;
        await new Promise((r) => setTimeout(r, 2000));
      }

      const status = await getStatus(tgId);
      if (!status.has_payment) {
        setError(t("pay.not_confirmed"));
        return;
      }

      await submitVideo(tgId, stagedVideoId);

      setDone(true);
      setApplicationComplete(true);

      const closeTarget = getWebApp();
      if (closeTarget?.close) {
        setTimeout(() => {
          closeTarget.close();
        }, 1200);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("misc.something_wrong");
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
            {t("done.title")}
          </h2>
          <p className="text-base text-text-secondary max-w-xs leading-relaxed">
            {t("done.desc_paid")}
          </p>
          <p className="text-sm text-text-tertiary mt-6">
            {t("done.close")}
          </p>
        </div>
      </div>
    );
  }

  const starsLabel = t("pay.cta", {
    amount: starsAmount,
    s: starsAmount === 1 ? "" : "s",
  });
  const benefits = benefitsData();

  return (
    <StepLayout
      step={2}
      ctaLabel={starsLabel}
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
              {t("pay.buy_stars")}
            </a>
          </div>
        )}

        <ClubBadge />

        <section className="text-center pt-1">
          <h2 className="text-2xl font-bold text-text-primary mb-1">
            {t("pay.title")}
          </h2>
          <p className="text-base text-text-secondary">
            {t("pay.subtitle")}
          </p>
        </section>

        <section>
          <div className="relative overflow-hidden rounded-2xl bg-surface border border-border shadow-md">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent to-accent-light" />

            <div className="p-5 space-y-4">
              <p className="text-sm text-text-secondary leading-relaxed">
                {t("pay.desc")}
              </p>

              <div className="space-y-3">
                {benefits.map((b) => (
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

            <div className="border-t border-border bg-surface-secondary px-5 py-4">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-text-primary">
                    {starsAmount}
                  </span>
                  <span className="text-base text-text-tertiary">
                    {t("pay.stars")}
                  </span>
                </div>
                <span className="text-xs text-text-tertiary">
                  {t("pay.one_time_fee")}
                </span>
              </div>
            </div>
          </div>
        </section>

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
            <span className="text-sm">{t("pay.secure")}</span>
          </div>
        </section>
      </div>
    </StepLayout>
  );
}
