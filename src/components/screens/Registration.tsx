"use client";

import { useState, useCallback } from "react";
import { useFormStore } from "@/store/useFormStore";
import { StepLayout } from "@/components/layout/StepLayout";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { COUNTRIES, POSITIONS, DOMINANT_FEET } from "@/types";
import { registerUser } from "@/lib/api";
import { getTelegramUserId } from "@/lib/telegram";

export function Registration() {
  const { form, updateForm, setStep } = useFormStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback(() => {
    const e: Record<string, string> = {};

    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.age) e.age = "Age is required";
    else {
      const age = Number(form.age);
      if (age < 10 || age > 60) e.age = "Age must be between 10 and 60";
    }
    if (!form.country) e.country = "Country is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.whatsappPhone.trim()) e.whatsappPhone = "WhatsApp number is required";
    else if (form.whatsappPhone.trim().length < 7)
      e.whatsappPhone = "Enter a valid phone number";
    if (!form.position) e.position = "Position is required";
    if (!form.dominantFoot) e.dominantFoot = "Select your dominant foot";
    if (!form.heightCm) e.heightCm = "Height is required";
    else {
      const h = Number(form.heightCm);
      if (h < 100 || h > 250) e.heightCm = "Height must be 100–250 cm";
    }
    if (!form.weightKg) e.weightKg = "Weight is required";
    else {
      const w = Number(form.weightKg);
      if (w < 30 || w > 200) e.weightKg = "Weight must be 30–200 kg";
    }
    if (!form.consentTerms) e.consentTerms = "You must agree to continue";

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const handleContinue = async () => {
    setSubmitError("");
    if (!validate()) return;

    const tgId = getTelegramUserId();
    if (!tgId) {
      setSubmitError("Please open this mini app from Telegram.");
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
        err instanceof Error ? err.message : "Could not register. Try again.";

      // Idempotency: if registration already exists, just continue.
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

  return (
    <StepLayout
      step={0}
      ctaLabel="Continue"
      ctaDisabled={!form.consentTerms || isSubmitting}
      ctaLoading={isSubmitting}
      onCta={handleContinue}
    >
      <div className="space-y-5 pt-2">
        {submitError && (
          <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3">
            <p className="text-sm text-error">{submitError}</p>
          </div>
        )}
        {/* Personal Info */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-1">
            Personal Information
          </h2>
          <p className="text-sm text-text-tertiary mb-4">
            Tell us about yourself
          </p>
          <div className="bg-surface rounded-2xl p-4 space-y-4 shadow-sm border border-border/50">
            <Input
              label="Full Name"
              placeholder="John Okafor"
              value={form.fullName}
              onChange={(v) => updateForm("fullName", v)}
              {...field("fullName")}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Age"
                type="number"
                inputMode="numeric"
                placeholder="22"
                value={form.age}
                onChange={(v) => updateForm("age", v)}
                {...field("age")}
              />
              <Select
                label="Country"
                value={form.country}
                options={COUNTRIES}
                placeholder="Select"
                onChange={(v) => updateForm("country", v)}
                {...field("country")}
              />
            </div>
            <Input
              label="City"
              placeholder="Lagos"
              value={form.city}
              onChange={(v) => updateForm("city", v)}
              {...field("city")}
            />
            <Input
              label="WhatsApp Phone"
              type="tel"
              inputMode="tel"
              placeholder="+234 800 000 0000"
              value={form.whatsappPhone}
              onChange={(v) => updateForm("whatsappPhone", v)}
              {...field("whatsappPhone")}
            />
            <Input
              label="Email"
              type="email"
              inputMode="email"
              placeholder="you@email.com"
              optional
              value={form.email}
              onChange={(v) => updateForm("email", v)}
            />
          </div>
        </section>

        {/* Football Profile */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-1">
            Football Profile
          </h2>
          <p className="text-sm text-text-tertiary mb-4">
            Your playing details
          </p>
          <div className="bg-surface rounded-2xl p-4 space-y-4 shadow-sm border border-border/50">
            <Select
              label="Position"
              value={form.position}
              options={POSITIONS}
              placeholder="Select position"
              onChange={(v) => updateForm("position", v)}
              {...field("position")}
            />
            <Select
              label="Dominant Foot"
              value={form.dominantFoot}
              options={[...DOMINANT_FEET]}
              placeholder="Select"
              onChange={(v) => updateForm("dominantFoot", v)}
              {...field("dominantFoot")}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Height (cm)"
                type="number"
                inputMode="numeric"
                placeholder="180"
                value={form.heightCm}
                onChange={(v) => updateForm("heightCm", v)}
                {...field("heightCm")}
              />
              <Input
                label="Weight (kg)"
                type="number"
                inputMode="numeric"
                placeholder="75"
                value={form.weightKg}
                onChange={(v) => updateForm("weightKg", v)}
                {...field("weightKg")}
              />
            </div>
            <Input
              label="Current Club"
              placeholder="Club name or N/A"
              optional
              value={form.currentClub}
              onChange={(v) => updateForm("currentClub", v)}
            />
            <Checkbox
              label="I am currently a free agent"
              checked={form.freeAgent}
              onChange={(v) => updateForm("freeAgent", v)}
            />
          </div>
        </section>

        {/* About */}
        <section>
          <div className="bg-surface rounded-2xl p-4 shadow-sm border border-border/50">
            <Textarea
              label="About You"
              placeholder="Briefly describe your football experience, achievements, or goals..."
              optional
              value={form.shortAbout}
              onChange={(v) => updateForm("shortAbout", v)}
              maxLength={500}
            />
            <p className="text-xs text-text-tertiary mt-1.5 text-right">
              {form.shortAbout.length}/500
            </p>
          </div>
        </section>

        {/* Consent */}
        <section className="pb-2">
          <Checkbox
            label={
              <>
                I agree to the{" "}
                <span className="text-accent underline">Terms of Service</span>{" "}
                and{" "}
                <span className="text-accent underline">Privacy Policy</span>
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
