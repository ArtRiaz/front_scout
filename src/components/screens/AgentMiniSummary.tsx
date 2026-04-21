"use client";

import { StepLayout } from "@/components/layout/StepLayout";
import { t } from "@/lib/i18n";
import { useFormStore } from "@/store/useFormStore";
import { getTelegramUserId, getWebApp } from "@/lib/telegram";
import { trackEvent } from "@/lib/api";

function roleLabel(role: string): string {
  const map: Record<string, Parameters<typeof t>[0]> = {
    agent: "agent.role.agent",
    scout: "agent.role.scout",
    academy: "agent.role.academy",
  };
  const key = map[role];
  return key ? t(key) : role;
}

export function AgentMiniSummary() {
  const { agentProfile } = useFormStore();

  const handleContinue = async () => {
    const tgId = getTelegramUserId();
    if (tgId) {
      await trackEvent(tgId, "agent_summary_continue");
    }
    getWebApp()?.showAlert?.(t("agent.next_phase_hint"));
  };

  if (!agentProfile) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center px-5">
        <p className="text-sm text-text-secondary">{t("agent.missing_profile")}</p>
      </div>
    );
  }

  return (
    <StepLayout
      step={0}
      stepLabelOverride={t("agent.step.summary")}
      ctaLabel={t("agent.cta.summary")}
      onCta={handleContinue}
    >
      <div className="space-y-5">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-primary">
            {t("agent.summary.title")}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {t("agent.summary.subtitle")}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-text-tertiary">{t("agent.summary.agent")}</dt>
              <dd className="text-right font-semibold text-text-primary">
                {agentProfile.firstName} {agentProfile.lastName}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-tertiary">{t("agent.summary.country")}</dt>
              <dd className="text-right font-medium text-text-primary">
                {agentProfile.country}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-tertiary">{t("agent.summary.status")}</dt>
              <dd className="text-right font-medium text-text-primary">
                {roleLabel(agentProfile.agentRole)}
              </dd>
            </div>
            <div className="border-t border-border pt-3 flex justify-between gap-4">
              <dt className="text-text-tertiary">
                {t("agent.summary.players_added")}
              </dt>
              <dd className="text-right font-bold text-brand">
                {agentProfile.playersAdded}/10
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </StepLayout>
  );
}
