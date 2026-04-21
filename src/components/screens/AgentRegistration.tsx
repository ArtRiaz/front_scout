"use client";

import { useState, useCallback } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ClubBadge } from "@/components/ui/ClubBadge";
import { COUNTRIES } from "@/types";
import { getAgentProfile, registerAgent } from "@/lib/api";
import { getTelegramUserId } from "@/lib/telegram";
import { t, getLocale } from "@/lib/i18n";
import { useFormStore } from "@/store/useFormStore";

const AGENT_ROLES = () => [
  { value: "agent", label: t("agent.role.agent") },
  { value: "scout", label: t("agent.role.scout") },
  { value: "academy", label: t("agent.role.academy") },
];

export function AgentRegistration() {
  const { setAgentSubStep, setAgentProfile } = useFormStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [agentRole, setAgentRole] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = t("agent.val.first_name");
    if (!lastName.trim()) e.lastName = t("agent.val.last_name");
    if (!country) e.country = t("agent.val.country");
    if (!agentRole) e.agentRole = t("agent.val.role");
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [firstName, lastName, country, agentRole]);

  const handleContinue = async () => {
    setSubmitError("");
    if (!validate()) return;

    const tgId = getTelegramUserId();
    if (!tgId) {
      setSubmitError(t("misc.open_from_tg"));
      return;
    }

    if (getLocale() !== "en") {
      setSubmitError(t("agent.en_only"));
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await registerAgent({
        telegram_user_id: tgId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        country,
        agent_role: agentRole as "agent" | "scout" | "academy",
      });
      setAgentProfile({
        firstName: res.first_name,
        lastName: res.last_name,
        country: res.country,
        agentRole: res.agent_role,
        playersAdded: res.players_count,
      });
      setAgentSubStep("summary");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("misc.something_wrong");
      if (message.toLowerCase().includes("already exists")) {
        try {
          const existing = await getAgentProfile(tgId);
          setAgentProfile({
            firstName: existing.first_name,
            lastName: existing.last_name,
            country: existing.country,
            agentRole: existing.agent_role,
            playersAdded: existing.players_count,
          });
          setAgentSubStep("summary");
        } catch {
          setSubmitError(message);
        }
        return;
      }
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StepLayout
      step={0}
      stepLabelOverride={t("agent.step.register")}
      ctaLabel={t("agent.cta.register")}
      ctaLoading={isSubmitting}
      onCta={handleContinue}
    >
      <div className="space-y-6">
        <div className="text-center">
          <ClubBadge />
          <h2 className="mt-4 text-xl font-bold text-text-primary">
            {t("agent.title")}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">{t("agent.subtitle")}</p>
        </div>

        {submitError ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-700">
            {submitError}
          </p>
        ) : null}

        <Input
          label={t("agent.first_name")}
          value={firstName}
          onChange={(v) => setFirstName(v)}
          error={errors.firstName}
          autoComplete="given-name"
        />
        <Input
          label={t("agent.last_name")}
          value={lastName}
          onChange={(v) => setLastName(v)}
          error={errors.lastName}
          autoComplete="family-name"
        />
        <Select
          label={t("agent.country")}
          value={country}
          onChange={setCountry}
          options={COUNTRIES.map((c) => ({ value: c, label: c }))}
          placeholder={t("reg.country_placeholder")}
          error={errors.country}
        />
        <Select
          label={t("agent.status")}
          value={agentRole}
          onChange={setAgentRole}
          options={AGENT_ROLES()}
          placeholder={t("agent.status_placeholder")}
          error={errors.agentRole}
        />
      </div>
    </StepLayout>
  );
}
