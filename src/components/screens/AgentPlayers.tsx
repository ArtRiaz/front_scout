"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { ClubBadge } from "@/components/ui/ClubBadge";
import { COUNTRIES, POSITIONS } from "@/types";
import {
  createAgentPlayer,
  deleteAgentBatchPlayer,
  listAgentBatchPlayers,
  type AgentBatchPlayer,
} from "@/lib/api";
import { getTelegramUserId } from "@/lib/telegram";
import { t } from "@/lib/i18n";
import { useFormStore } from "@/store/useFormStore";

const DOMINANT_FEET = [
  { value: "right", label: t("foot.right") },
  { value: "left", label: t("foot.left") },
  { value: "both", label: t("foot.both") },
] as const;

const MAX_VIDEO_MB = 250;
const ACCEPTED_VIDEO = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/webm",
];

function formatSizeMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

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
  const [uploadPct, setUploadPct] = useState(0);
  const [batchPlayers, setBatchPlayers] = useState<AgentBatchPlayer[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isPreparingFile, setIsPreparingFile] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const submitInFlight = useRef(false);

  const playersAdded = agentProfile?.playersAdded ?? 0;
  const paidPlayersCount = agentProfile?.paidPlayersCount ?? 0;
  const canContinue = playersAdded >= 2;
  const canAddMore = playersAdded < 10;

  const refreshBatch = useCallback(async () => {
    const tgId = getTelegramUserId();
    if (!tgId) return;
    try {
      const list = await listAgentBatchPlayers(tgId);
      setBatchPlayers(list);
    } catch {
      // soft-fail: list is optional UX
    }
  }, []);

  useEffect(() => {
    void refreshBatch();
  }, [refreshBatch, playersAdded]);

  const handleRemove = async (id: string) => {
    const tgId = getTelegramUserId();
    if (!tgId || removingId) return;
    setSubmitError("");
    setRemovingId(id);
    try {
      const res = await deleteAgentBatchPlayer(tgId, id);
      setBatchPlayers((prev) => prev.filter((p) => p.id !== id));
      if (agentProfile) {
        setAgentProfile({ ...agentProfile, playersAdded: res.players_count });
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : t("misc.something_wrong"),
      );
    } finally {
      setRemovingId(null);
    }
  };

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
    if (fileRef.current) fileRef.current.value = "";
  };

  const pickFile = async (picked: File | undefined) => {
    if (!picked) return;
    setSubmitError("");
    if (picked.type && !ACCEPTED_VIDEO.includes(picked.type)) {
      setErrors((e) => ({ ...e, file: t("video.invalid_type") }));
      return;
    }
    if (picked.size > MAX_VIDEO_MB * 1024 * 1024) {
      setErrors((e) => ({
        ...e,
        file: t("video.too_large", { size: MAX_VIDEO_MB }),
      }));
      return;
    }
    setErrors((e) => {
      const { file: _omit, ...rest } = e;
      return rest;
    });
    // iOS Telegram WebView often releases the underlying picker blob
    // before XHR can stream it. Read into memory now so the upload uses
    // a stable in-process Blob, not a lazy reference into the picker.
    setIsPreparingFile(true);
    try {
      const buffer = await picked.arrayBuffer();
      const stable = new File([buffer], picked.name, {
        type: picked.type || "video/mp4",
        lastModified: picked.lastModified,
      });
      setFile(stable);
    } catch {
      setFile(picked);
    } finally {
      setIsPreparingFile(false);
    }
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
    if (submitInFlight.current) return;
    setSubmitError("");
    if (!validate()) return;
    const tgId = getTelegramUserId();
    if (!tgId) {
      setSubmitError(t("misc.open_from_tg"));
      return;
    }
    if (!file) return;
    submitInFlight.current = true;
    try {
      setIsSubmitting(true);
      setUploadPct(0);
      const res = await createAgentPlayer(
        {
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
        },
        (pct) => setUploadPct(pct),
      );
      if (agentProfile) {
        setAgentProfile({ ...agentProfile, playersAdded: res.players_count });
      }
      resetForm();
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const lower = raw.toLowerCase();
      let message = raw || t("misc.something_wrong");
      if (
        lower.includes("load failed") ||
        lower.includes("failed to fetch") ||
        lower.includes("network error") ||
        lower.includes("aborted") ||
        lower.includes("timed out")
      ) {
        message = t("agent.players.err.network");
      } else if (lower.includes("413") || lower.includes("too large")) {
        message = t("video.too_large", { size: MAX_VIDEO_MB });
      }
      // Always append the raw XHR diagnostic so we can debug iOS WebView
      // upload aborts directly from the user's screen.
      const diagMatch = raw.match(/\[upload [^\]]+\][^]*$/);
      if (diagMatch && !message.includes(diagMatch[0])) {
        message = `${message}\n${diagMatch[0]}`;
      }
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
      setUploadPct(0);
      submitInFlight.current = false;
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
      ctaLoading={isSubmitting || isPreparingFile}
      ctaDisabled={
        isSubmitting || isPreparingFile || (!canAddMore && !canContinue)
      }
      onCta={handleCta}
    >
      <div className="space-y-5">
        <ClubBadge />

        {paidPlayersCount > 0 ? (
          <div className="rounded-2xl border border-brand/30 bg-brand/5 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-6 w-6 flex-shrink-0 rounded-full bg-success/15 text-success flex items-center justify-center">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.4}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-sm leading-relaxed text-text-primary">
                <p className="font-semibold">
                  {t("agent.players.previous_title", { count: paidPlayersCount })}
                </p>
                <p className="mt-1 text-text-secondary">
                  {t("agent.players.previous_desc")}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="text-lg font-bold text-text-primary">
            {t("agent.players.title")}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {t("agent.players.subtitle")}
          </p>
        </div>

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

        {batchPlayers.length > 0 ? (
          <section className="rounded-2xl border border-border bg-white p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-primary mb-3">
              {t("agent.players.batch_title")}
            </h3>
            <ul className="space-y-2">
              {batchPlayers.map((p, idx) => {
                const isRemoving = removingId === p.id;
                return (
                  <li
                    key={p.id}
                    className="flex items-start gap-3 rounded-xl border border-border bg-surface px-3 py-2.5"
                  >
                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {p.first_name} {p.last_name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-text-tertiary">
                        {p.position} · {p.height_cm} cm · {p.weight_kg} kg ·{" "}
                        {p.free_agent ? t("agent.players.free_agent") : p.current_club || "—"}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isRemoving}
                      onClick={() => handleRemove(p.id)}
                      aria-label={t("agent.players.remove")}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      {isRemoving ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-text-tertiary border-t-transparent" />
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {submitError ? (
          <p className="whitespace-pre-line break-words rounded-lg bg-red-50 px-3 py-2 text-left text-xs text-red-700 [overflow-wrap:anywhere] sm:text-sm">
            {submitError}
          </p>
        ) : null}

        {canAddMore ? (
          <>
            <Input
              label={t("agent.first_name")}
              value={firstName}
              onChange={setFirstName}
              error={errors.first_name}
            />
            <Input
              label={t("agent.last_name")}
              value={lastName}
              onChange={setLastName}
              error={errors.last_name}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t("reg.height")}
                value={heightCm}
                onChange={setHeightCm}
                error={errors.height_cm}
                type="number"
              />
              <Input
                label={t("reg.weight")}
                value={weightKg}
                onChange={setWeightKg}
                error={errors.weight_kg}
                type="number"
              />
            </div>
            <Select
              label={t("reg.position")}
              value={position}
              onChange={setPosition}
              options={POSITIONS}
              placeholder={t("reg.position_placeholder")}
              error={errors.position}
            />
            <Select
              label={t("reg.dominant_foot")}
              value={dominantFoot}
              onChange={setDominantFoot}
              options={DOMINANT_FEET}
              placeholder={t("reg.dominant_foot_placeholder")}
              error={errors.dominant_foot}
            />
            <Select
              label={t("agent.country")}
              value={country}
              onChange={setCountry}
              options={COUNTRIES}
              placeholder={t("reg.country_placeholder")}
              error={errors.country}
            />
            <Input
              label={t("reg.current_club")}
              value={currentClub}
              onChange={setCurrentClub}
              error={errors.current_club}
              disabled={freeAgent}
            />
            <Checkbox
              checked={freeAgent}
              onChange={setFreeAgent}
              label={t("reg.free_agent")}
            />

            <section>
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-2">
                {t("agent.players.video")}
              </h3>
              <input
                ref={fileRef}
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0] ?? undefined)}
              />

              {!file ? (
                <button
                  type="button"
                  disabled={isPreparingFile}
                  onClick={() => fileRef.current?.click()}
                  className="w-full rounded-2xl border-2 border-dashed border-brand/50 bg-brand/5 p-6 text-center transition-all duration-200 hover:border-brand hover:bg-brand/10 active:scale-[0.99] disabled:opacity-60"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-brand/15 text-brand flex items-center justify-center">
                      <svg
                        className="h-7 w-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.6}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-text-primary">
                        {t("video.tap_upload")}
                      </p>
                      <p className="text-sm text-text-tertiary mt-1">
                        {t("video.formats")} ·{" "}
                        {t("video.max_size", { size: MAX_VIDEO_MB })}
                      </p>
                    </div>
                  </div>
                </button>
              ) : (
                <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="h-6 w-6 text-success"
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
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {formatSizeMb(file.size)} MB
                      </p>
                    </div>
                    {!isSubmitting ? (
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          if (fileRef.current) fileRef.current.value = "";
                        }}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-text-tertiary hover:bg-surface-secondary hover:text-text-primary transition-colors"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    ) : null}
                  </div>
                  {isSubmitting ? (
                    <div className="mt-3">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
                        <div
                          className="h-full rounded-full bg-brand transition-[width] duration-200"
                          style={{ width: `${uploadPct}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-text-tertiary">
                        {uploadPct < 100
                          ? `Uploading… ${uploadPct}%`
                          : "Processing…"}
                      </p>
                    </div>
                  ) : null}
                </div>
              )}

              {errors.file ? (
                <p className="text-sm text-error mt-2">{errors.file}</p>
              ) : null}
            </section>
          </>
        ) : null}

        {canContinue ? (
          <div className="rounded-2xl border-2 border-brand/60 bg-brand/5 p-4 shadow-sm">
            <p className="text-sm text-text-secondary">
              {t("agent.players.ready_hint")}
            </p>
            <button
              type="button"
              onClick={handleContinue}
              disabled={isSubmitting}
              className="mt-3 flex w-full items-center justify-center gap-2 h-14 rounded-xl bg-brand text-white font-semibold text-base shadow-md transition-all duration-200 hover:bg-brand-light active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              <span>{t("agent.players.cta_continue")}</span>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 5l7 7-7 7M5 12h15"
                />
              </svg>
            </button>
          </div>
        ) : null}
      </div>
    </StepLayout>
  );
}
