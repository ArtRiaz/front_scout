"use client";

import { useState } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { ClubBadge } from "@/components/ui/ClubBadge";
import { initiateAgentCheckout, getStatus } from "@/lib/api";
import { getTelegramUserId, getWebApp } from "@/lib/telegram";
import { t } from "@/lib/i18n";
import { useFormStore } from "@/store/useFormStore";

const TARIFFS: Array<{
  key: "standard" | "priority";
  price: number;
  labelKey: "agent.pay.tariff.standard" | "agent.pay.tariff.priority";
}> = [
  { key: "standard", price: 80, labelKey: "agent.pay.tariff.standard" },
  { key: "priority", price: 150, labelKey: "agent.pay.tariff.priority" },
];

export function AgentPayment() {
  const { agentProfile, setApplicationComplete, setAgentCheckout } = useFormStore();
  const [submissionType, setSubmissionType] = useState<"standard" | "priority">(
    "standard",
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const playersCount = agentProfile?.playersAdded ?? 0;
  const unitPrice = TARIFFS.find((t) => t.key === submissionType)?.price ?? 80;
  const totalStars = unitPrice * playersCount;

  const handlePay = async () => {
    setError("");
    const tgId = getTelegramUserId();
    if (!tgId) {
      setError(t("misc.open_from_tg"));
      return;
    }
    try {
      setIsSubmitting(true);
      const payment = await initiateAgentCheckout({
        telegram_user_id: tgId,
        submission_type: submissionType,
      });
      setAgentCheckout({
        submissionType,
        unitPrice: payment.unit_price,
        totalStars: payment.total_stars,
      });

      const webapp = getWebApp();
      if (!webapp?.openInvoice) {
        setError(t("pay.invoice_unavailable"));
        return;
      }

      const invoiceResult = await new Promise<
        "paid" | "cancelled" | "failed" | "pending"
      >((resolve) => {
        try {
          webapp.openInvoice(payment.invoice_link, (status) => resolve(status));
        } catch {
          resolve("failed");
        }
      });

      if (invoiceResult === "cancelled" || invoiceResult === "failed") {
        setError(t("pay.not_confirmed"));
        return;
      }

      const startedAt = Date.now();
      const timeoutMs = invoiceResult === "paid" ? 60_000 : 180_000;
      let confirmed = false;
      while (Date.now() - startedAt < timeoutMs) {
        const status = await getStatus(tgId);
        if (status.has_payment) {
          confirmed = true;
          break;
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      if (!confirmed) {
        setError(t("pay.not_confirmed"));
        return;
      }
      setApplicationComplete(true);
      getWebApp()?.close?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("misc.something_wrong"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StepLayout
      step={2}
      stepLabelOverride={t("agent.step.payment")}
      ctaLabel={t("agent.pay.cta", { amount: totalStars })}
      ctaLoading={isSubmitting}
      ctaDisabled={playersCount < 2}
      onCta={handlePay}
    >
      <div className="space-y-5">
        <ClubBadge />
        <div className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="text-lg font-bold text-text-primary">{t("agent.pay.title")}</h2>
          <p className="text-sm text-text-secondary mt-1">
            {t("agent.pay.subtitle")}
          </p>
        </div>

        <div className="space-y-3">
          {TARIFFS.map((tariff) => {
            const selected = submissionType === tariff.key;
            return (
              <button
                type="button"
                key={tariff.key}
                onClick={() => setSubmissionType(tariff.key)}
                className={`w-full rounded-xl border px-4 py-3 text-left ${
                  selected
                    ? "border-brand bg-brand/5"
                    : "border-border bg-white"
                }`}
              >
                <p className="font-semibold text-text-primary">{t(tariff.labelKey)}</p>
                <p className="text-sm text-text-secondary">
                  {tariff.price} Stars / {t("agent.pay.per_player")}
                </p>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-border bg-white p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-text-tertiary">{t("agent.summary.agent")}</span>
            <span className="font-medium text-text-primary">
              {agentProfile?.firstName} {agentProfile?.lastName}
            </span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-text-tertiary">{t("agent.summary.country")}</span>
            <span className="font-medium text-text-primary">{agentProfile?.country}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-text-tertiary">{t("agent.pay.players")}</span>
            <span className="font-medium text-text-primary">{playersCount}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-text-tertiary">{t("agent.pay.type")}</span>
            <span className="font-medium text-text-primary">
              {submissionType === "priority"
                ? t("agent.pay.tariff.priority")
                : t("agent.pay.tariff.standard")}
            </span>
          </div>
          <div className="mt-3 border-t border-border pt-3 flex justify-between">
            <span className="font-semibold text-text-primary">{t("agent.pay.total")}</span>
            <span className="font-bold text-brand">{totalStars} Stars</span>
          </div>
        </div>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </div>
    </StepLayout>
  );
}
