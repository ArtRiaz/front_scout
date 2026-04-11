"use client";

import { useState, useCallback } from "react";
import { useFormStore } from "@/store/useFormStore";
import { StepLayout } from "@/components/layout/StepLayout";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { COUNTRIES, POSITIONS } from "@/types";
import { registerUser } from "@/lib/api";
import { getTelegramUserId } from "@/lib/telegram";
import { ClubBadge } from "@/components/ui/ClubBadge";
import { t, getLocale } from "@/lib/i18n";

const DOMINANT_FEET_I18N = () => [
  { value: "right", label: t("foot.right") },
  { value: "left", label: t("foot.left") },
  { value: "both", label: t("foot.both") },
];

const POSITIONS_I18N = () => {
  const keys: Record<string, Parameters<typeof t>[0]> = {
    "Goalkeeper": "pos.goalkeeper",
    "Centre-Back": "pos.centre_back",
    "Left-Back": "pos.left_back",
    "Right-Back": "pos.right_back",
    "Defensive Midfielder": "pos.defensive_mid",
    "Central Midfielder": "pos.central_mid",
    "Attacking Midfielder": "pos.attacking_mid",
    "Left Winger": "pos.left_winger",
    "Right Winger": "pos.right_winger",
    "Striker": "pos.striker",
    "Centre-Forward": "pos.centre_forward",
  };
  return POSITIONS.map((p) => ({
    value: p,
    label: keys[p] ? t(keys[p]) : p,
  }));
};

export function Registration() {
  const { form, updateForm, setStep } = useFormStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback(() => {
    const e: Record<string, string> = {};

    if (!form.fullName.trim()) e.fullName = t("val.full_name_required");
    if (!form.age) e.age = t("val.age_required");
    else {
      const age = Number(form.age);
      if (age < 10 || age > 60) e.age = t("val.age_range");
    }
    if (!form.country) e.country = t("val.country_required");
    if (!form.city.trim()) e.city = t("val.city_required");
    if (!form.whatsappPhone.trim()) e.whatsappPhone = t("val.whatsapp_required");
    else if (form.whatsappPhone.trim().length < 7)
      e.whatsappPhone = t("val.whatsapp_invalid");
    if (!form.position) e.position = t("val.position_required");
    if (!form.dominantFoot) e.dominantFoot = t("val.foot_required");
    if (!form.heightCm) e.heightCm = t("val.height_required");
    else {
      const h = Number(form.heightCm);
      if (h < 100 || h > 250) e.heightCm = t("val.height_range");
    }
    if (!form.weightKg) e.weightKg = t("val.weight_required");
    else {
      const w = Number(form.weightKg);
      if (w < 30 || w > 200) e.weightKg = t("val.weight_range");
    }
    if (!form.consentTerms) e.consentTerms = t("val.consent_required");

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const handleContinue = async () => {
    setSubmitError("");
    if (!validate()) return;

    const tgId = getTelegramUserId();
    if (!tgId) {
      setSubmitError(t("misc.open_from_tg"));
      return;
    }

    try {
      setIsSubmitting(true);
      await registerUser({
        telegram_user_id: tgId,
        full_name: form.fullName.trim(),
        age: Number(form.age),
        country: form.country,
        city: form.city.trim(),
        whatsapp_phone: form.whatsappPhone.trim(),
        email: form.email.trim() || null,
        position: form.position,
        dominant_foot: form.dominantFoot,
        height_cm: Number(form.heightCm),
        weight_kg: Number(form.weightKg),
        current_club: form.currentClub.trim() || null,
        free_agent: form.freeAgent,
        short_about: form.shortAbout.trim() || null,
        consent_terms: form.consentTerms,
        consent_updates: false,
      });
      setStep(1);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("misc.something_wrong");

      if (message.toLowerCase().includes("already registered")) {
        setStep(1);
        return;
      }

      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = (key: string) => ({
    error: errors[key],
  });

  const isUk = getLocale() === "uk";

  return (
    <StepLayout
      step={0}
      ctaLabel={t("reg.cta")}
      ctaDisabled={!form.consentTerms || isSubmitting}
      ctaLoading={isSubmitting}
      onCta={handleContinue}
    >
      <div className="space-y-5 pt-2">
        <ClubBadge />
        {submitError && (
          <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3">
            <p className="text-sm text-error">{submitError}</p>
          </div>
        )}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-1">
            {t("reg.personal_title")}
          </h2>
          <p className="text-sm text-text-tertiary mb-4">
            {t("reg.personal_desc")}
          </p>
          <div className="bg-surface rounded-2xl p-4 space-y-4 shadow-sm border border-border/50">
            <Input
              label={t("reg.full_name")}
              placeholder={t("reg.full_name_placeholder")}
              value={form.fullName}
              onChange={(v) => updateForm("fullName", v)}
              {...field("fullName")}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t("reg.age")}
                type="number"
                inputMode="numeric"
                placeholder="22"
                value={form.age}
                onChange={(v) => updateForm("age", v)}
                {...field("age")}
              />
              <Select
                label={t("reg.country")}
                value={form.country}
                options={COUNTRIES}
                placeholder={t("reg.country_placeholder")}
                onChange={(v) => updateForm("country", v)}
                {...field("country")}
              />
            </div>
            <Input
              label={t("reg.city")}
              placeholder={t("reg.city_placeholder")}
              value={form.city}
              onChange={(v) => updateForm("city", v)}
              {...field("city")}
            />
            <Input
              label={t("reg.whatsapp")}
              type="tel"
              inputMode="tel"
              placeholder="+234 800 000 0000"
              value={form.whatsappPhone}
              onChange={(v) => updateForm("whatsappPhone", v)}
              {...field("whatsappPhone")}
            />
            <Input
              label={t("reg.email")}
              type="email"
              inputMode="email"
              placeholder={t("reg.email_placeholder")}
              optional
              optionalLabel={isUk ? t("reg.optional") : undefined}
              value={form.email}
              onChange={(v) => updateForm("email", v)}
            />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-1">
            {t("reg.football_title")}
          </h2>
          <p className="text-sm text-text-tertiary mb-4">
            {t("reg.football_desc")}
          </p>
          <div className="bg-surface rounded-2xl p-4 space-y-4 shadow-sm border border-border/50">
            <Select
              label={t("reg.position")}
              value={form.position}
              options={POSITIONS_I18N().map((p) => p.label)}
              optionValues={POSITIONS_I18N().map((p) => p.value)}
              placeholder={t("reg.position_placeholder")}
              onChange={(v) => updateForm("position", v)}
              {...field("position")}
            />
            <Select
              label={t("reg.dominant_foot")}
              value={form.dominantFoot}
              options={DOMINANT_FEET_I18N().map((f) => f.label)}
              optionValues={DOMINANT_FEET_I18N().map((f) => f.value)}
              placeholder={t("reg.dominant_foot_placeholder")}
              onChange={(v) => updateForm("dominantFoot", v)}
              {...field("dominantFoot")}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t("reg.height")}
                type="number"
                inputMode="numeric"
                placeholder="180"
                value={form.heightCm}
                onChange={(v) => updateForm("heightCm", v)}
                {...field("heightCm")}
              />
              <Input
                label={t("reg.weight")}
                type="number"
                inputMode="numeric"
                placeholder="75"
                value={form.weightKg}
                onChange={(v) => updateForm("weightKg", v)}
                {...field("weightKg")}
              />
            </div>
            <Input
              label={t("reg.current_club")}
              placeholder={t("reg.current_club_placeholder")}
              optional
              optionalLabel={isUk ? t("reg.optional") : undefined}
              value={form.currentClub}
              onChange={(v) => updateForm("currentClub", v)}
            />
            <Checkbox
              label={t("reg.free_agent")}
              checked={form.freeAgent}
              onChange={(v) => updateForm("freeAgent", v)}
            />
          </div>
        </section>

        <section>
          <div className="bg-surface rounded-2xl p-4 shadow-sm border border-border/50">
            <Textarea
              label={t("reg.about")}
              placeholder={t("reg.about_placeholder")}
              optional
              optionalLabel={isUk ? t("reg.optional") : undefined}
              value={form.shortAbout}
              onChange={(v) => updateForm("shortAbout", v)}
              maxLength={500}
            />
            <p className="text-xs text-text-tertiary mt-1.5 text-right">
              {form.shortAbout.length}/500
            </p>
          </div>
        </section>

        <section className="pb-2">
          <Checkbox
            label={
              <>
                {t("reg.consent_terms")}{" "}
                <span className="text-accent underline">{t("reg.terms")}</span>{" "}
                {t("reg.and")}{" "}
                <span className="text-accent underline">{t("reg.privacy")}</span>
              </>
            }
            checked={form.consentTerms}
            onChange={(v) => updateForm("consentTerms", v)}
            error={errors.consentTerms}
          />
        </section>
      </div>
    </StepLayout>
  );
}
