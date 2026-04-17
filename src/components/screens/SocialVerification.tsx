"use client";

import { useCallback, useEffect, useState } from "react";
import { useFormStore } from "@/store/useFormStore";
import { StepLayout } from "@/components/layout/StepLayout";
import { ClubBadge } from "@/components/ui/ClubBadge";
import { getTelegramUserId, getWebApp } from "@/lib/telegram";
import {
  getSocialConfig,
  getSocialStatus,
  confirmInstagram,
  checkTelegram,
  submitVideo,
  trackEvent,
} from "@/lib/api";
import { t } from "@/lib/i18n";

type TaskState = "idle" | "loading" | "done" | "error";

function CheckIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function SocialVerification() {
  const { stagedVideoId, isSubmitting, setSubmitting, setApplicationComplete } =
    useFormStore();

  const [igState, setIgState] = useState<TaskState>("idle");
  const [igOpened, setIgOpened] = useState(false);
  const [tgState, setTgState] = useState<TaskState>("idle");
  const [tgError, setTgError] = useState("");
  const [igUrl, setIgUrl] = useState("");
  const [tgUrl, setTgUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getSocialConfig()
      .then((cfg) => {
        setIgUrl(cfg.instagram_url);
        setTgUrl(cfg.telegram_channel_url);
      })
      .catch(() => {});

    const tgId = getTelegramUserId();
    if (tgId) {
      getSocialStatus(tgId)
        .then((s) => {
          if (s.instagram_done) setIgState("done");
          if (s.telegram_done) setTgState("done");
        })
        .catch(() => {});
    }
  }, []);

  const allDone = igState === "done" && tgState === "done";

  const handleOpenInstagram = () => {
    if (igUrl) window.open(igUrl, "_blank", "noopener,noreferrer");
    setIgOpened(true);
    const tgId = getTelegramUserId();
    if (tgId) trackEvent(tgId, "instagram_link_opened").catch(() => {});
  };

  const handleConfirmInstagram = useCallback(async () => {
    const tgId = getTelegramUserId();
    if (!tgId) return;
    setIgState("loading");
    await new Promise((r) => setTimeout(r, 5500));
    try {
      await confirmInstagram(tgId);
      setIgState("done");
    } catch {
      setIgState("done");
    }
  }, []);

  const handleOpenTelegram = () => {
    if (tgUrl) window.open(tgUrl, "_blank", "noopener,noreferrer");
  };

  const handleCheckTelegram = useCallback(async () => {
    const tgId = getTelegramUserId();
    if (!tgId) return;
    setTgState("loading");
    setTgError("");
    try {
      const res = await checkTelegram(tgId);
      if (res.telegram_done) {
        setTgState("done");
      } else {
        setTgState("error");
        setTgError(t("social.tg_not_found"));
      }
    } catch {
      setTgState("error");
      setTgError(t("social.tg_not_found"));
    }
  }, []);

  const handleSubmit = async () => {
    if (!allDone) return;
    const tgId = getTelegramUserId();
    if (!tgId) return;
    try {
      setError("");
      setSubmitting(true);
      if (stagedVideoId) {
        await submitVideo(tgId, stagedVideoId);
      } else {
        await trackEvent(tgId, "social_submitted_without_video");
      }
      setApplicationComplete(true);
      const webapp = getWebApp();
      if (webapp?.close) setTimeout(() => webapp.close(), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("misc.something_wrong"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StepLayout
      step={2}
      ctaLabel={t("social.cta")}
      ctaDisabled={!allDone || isSubmitting}
      ctaLoading={isSubmitting}
      onCta={handleSubmit}
      stepLabelOverride={t("step.social")}
    >
      <div className="space-y-5 pt-2">
        <ClubBadge />

        <section className="text-center">
          <h2 className="text-xl font-bold text-text-primary mb-1">{t("social.title")}</h2>
          <p className="text-sm text-text-secondary leading-relaxed">{t("social.desc")}</p>
        </section>

        {error && (
          <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* ── Instagram block ── */}
        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">{t("social.instagram")}</p>
              <p className="text-xs text-text-secondary">{t("social.instagram_desc")}</p>
            </div>
            {igState === "done" && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-white">
                <CheckIcon />
              </span>
            )}
          </div>

          <div className="px-4 py-3">
            {igState === "done" ? (
              <p className="text-sm font-medium text-success text-center">{t("social.done_ig")}</p>
            ) : igState === "loading" ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <Spinner className="h-5 w-5 text-accent" />
                <p className="text-xs text-text-tertiary">{t("social.checking")}</p>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleOpenInstagram}
                  className="flex-1 rounded-xl border border-border bg-surface-secondary py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-border/40"
                >
                  {t("social.open_instagram")}
                </button>
                {igOpened && (
                  <button
                    type="button"
                    onClick={handleConfirmInstagram}
                    className="flex-1 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-light"
                  >
                    {t("social.i_subscribed_ig")}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── Telegram block ── */}
        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2AABEE] text-white">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">{t("social.telegram")}</p>
              <p className="text-xs text-text-secondary">{t("social.telegram_desc")}</p>
            </div>
            {tgState === "done" && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-white">
                <CheckIcon />
              </span>
            )}
          </div>

          <div className="px-4 py-3">
            {tgState === "done" ? (
              <p className="text-sm font-medium text-success text-center">{t("social.done_tg")}</p>
            ) : (
              <>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleOpenTelegram}
                    className="flex-1 rounded-xl border border-border bg-surface-secondary py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-border/40"
                  >
                    {t("social.open_telegram")}
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckTelegram}
                    disabled={tgState === "loading"}
                    className="flex-1 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-light disabled:opacity-50"
                  >
                    {tgState === "loading" ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Spinner />
                        {t("social.checking")}
                      </span>
                    ) : (
                      t("social.check_telegram")
                    )}
                  </button>
                </div>
                {tgError && (
                  <p className="mt-2 text-xs text-error text-center">{tgError}</p>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </StepLayout>
  );
}
