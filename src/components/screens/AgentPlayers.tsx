"use client";

import { useMemo, useState } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { ClubBadge } from "@/components/ui/ClubBadge";
import { COUNTRIES, POSITIONS } from "@/types";
import { createAgentPlayer } from "@/lib/api";
import { getTelegramUserId } from "@/lib/telegram";
import { t } from "@/lib/i18n";
import { useFormStore } from "@/store/useFormStore";

const DOMINANT_FEET = [
  { value: "right", label: t("foot.right") },
  { value: "left", label: t("foot.left") },
  { value: "both", label: t("foot.both") },
] as const;

export function AgentPlayers() {
  const { agentProfile, setAgentProfile, setAgentSubStep } = useFormStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [position, setPosition] = useState("");
  const [dominantFoot, setDominantFoot] = useState("");
  const [country, setCountry] = useState("");
  const [currentClub, setCurrentClub] = useState("");
  const [freeAgent, setFreeAgent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const playersAdded = agentProfile?.playersAdded ?? 0;
  const canContinue = playersAdded >= 2;
  const canAddMore = playersAdded < 10;

  const ctaLabel = useMemo(() => {
    if (canAddMore) return t("agent.players.cta_add");
    return t("agent.players.cta_continue_only");
  }, [canAddMore]);

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setHeightCm("");
    setWeightKg("");
    setPosition("");
    setDominantFoot("");
    setCountry("");
    setCurrentClub("");
    setFreeAgent(false);
    setFile(null);
    setErrors({});
    setSubmitError("");
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.first_name = t("agent.val.first_name");
    if (!lastName.trim()) e.last_name = t("agent.val.last_name");
    if (!heightCm) e.height_cm = t("val.height_required");
    if (!weightKg) e.weight_kg = t("val.weight_required");
    if (!position) e.position = t("val.position_required");
    if (!dominantFoot) e.dominant_foot = t("val.foot_required");
    if (!country) e.country = t("val.country_required");
    if (!freeAgent && !currentClub.trim()) e.current_club = t("agent.players.val.club");
    if (!file) e.file = t("agent.players.val.video");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddPlayer = async () => {
    setSubmitError("");
    if (!validate()) return;
    const tgId = getTelegramUserId();
    if (!tgId) {
      setSubmitError(t("misc.open_from_tg"));
      return;
    }
    if (!file) return;
    try {
      setIsSubmitting(true);
      const res = await createAgentPlayer({
        telegram_user_id: tgId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        height_cm: Number(heightCm),
        weight_kg: Number(weightKg),
        position,
        dominant_foot: dominantFoot as "left" | "right" | "both",
        country,
        current_club: freeAgent ? null : currentClub.trim(),
        free_agent: freeAgent,
        file,
      });
      if (agentProfile) {
        setAgentProfile({ ...agentProfile, playersAdded: res.players_count });
      }
      resetForm();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : t("misc.something_wrong"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCta = async () => {
    if (canAddMore) {
      await handleAddPlayer();
    } else if (canContinue) {
      setAgentSubStep("payment");
    }
  };

  const handleContinue = () => {
    setAgentSubStep("payment");
  };

  return (
    <StepLayout
      step={1}
      stepLabelOverride={t("agent.step.players")}
      ctaLabel={ctaLabel}
      ctaLoading={isSubmitting}
      ctaDisabled={isSubmitting || (!canAddMore && !canContinue)}
      onCta={handleCta}
    >
      <div className="space-y-5">
        <ClubBadge />
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm text-text-secondary">
            {t("agent.players.added")}:{" "}
            <span className="font-bold text-brand">{playersAdded}/10</span>
          </p>
          {!canContinue ? (
            <p className="mt-1 text-xs text-text-tertiary">
              {t("agent.players.minimum")}
            </p>
          ) : null}
        </div>

        {submitError ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-700">
            {submitError}
          </p>
        ) : null}

        {canAddMore ? (
          <>
            <Input label={t("agent.first_name")} value={firstName} onChange={setFirstName} error={errors.first_name} />
            <Input label={t("agent.last_name")} value={lastName} onChange={setLastName} error={errors.last_name} />
            <div className="grid grid-cols-2 gap-3">
              <Input label={t("reg.height")} value={heightCm} onChange={setHeightCm} error={errors.height_cm} type="number" />
              <Input label={t("reg.weight")} value={weightKg} onChange={setWeightKg} error={errors.weight_kg} type="number" />
            </div>
            <Select label={t("reg.position")} value={position} onChange={setPosition} options={POSITIONS} placeholder={t("reg.position_placeholder")} error={errors.position} />
            <Select label={t("reg.dominant_foot")} value={dominantFoot} onChange={setDominantFoot} options={DOMINANT_FEET} placeholder={t("reg.dominant_foot_placeholder")} error={errors.dominant_foot} />
            <Select label={t("agent.country")} value={country} onChange={setCountry} options={COUNTRIES} placeholder={t("reg.country_placeholder")} error={errors.country} />
            <Input label={t("reg.current_club")} value={currentClub} onChange={setCurrentClub} error={errors.current_club} disabled={freeAgent} />
            <Checkbox checked={freeAgent} onChange={setFreeAgent} label={t("reg.free_agent")} />
            <div className="rounded-xl border border-border bg-white px-4 py-3">
              <label className="block text-sm font-medium text-text-primary mb-2">
                {t("agent.players.video")}
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm"
              />
              {errors.file ? <p className="text-sm text-error mt-1">{errors.file}</p> : null}
            </div>
          </>
        ) : null}

        {canContinue ? (
          <button
            type="button"
            onClick={handleContinue}
            className="w-full h-12 rounded-xl border border-border bg-white text-text-primary font-semibold"
          >
            {t("agent.players.cta_continue")}
          </button>
        ) : null}
      </div>
    </StepLayout>
  );
}
