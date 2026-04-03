import { create } from "zustand";
import type { FormData, Step } from "@/types";

interface FormStore {
  step: Step;
  form: FormData;
  stagedVideoId: string | null;
  stagedVideoName: string;
  isSubmitting: boolean;
  /** Set when user already finished video submit + payment (resume shows thank-you). */
  applicationComplete: boolean;
  setStep: (step: Step) => void;
  updateForm: (field: keyof FormData, value: string | boolean) => void;
  setStagedVideo: (videoId: string | null, videoName?: string) => void;
  setSubmitting: (v: boolean) => void;
  setApplicationComplete: (v: boolean) => void;
  reset: () => void;
}

const initialForm: FormData = {
  fullName: "",
  age: "",
  country: "",
  city: "",
  whatsappPhone: "",
  email: "",
  position: "",
  dominantFoot: "",
  heightCm: "",
  weightKg: "",
  currentClub: "",
  freeAgent: false,
  shortAbout: "",
  consentTerms: false,
};

export const useFormStore = create<FormStore>((set) => ({
  step: 0,
  form: { ...initialForm },
  stagedVideoId: null,
  stagedVideoName: "",
  isSubmitting: false,
  applicationComplete: false,

  setStep: (step) => set({ step }),

  updateForm: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

  setStagedVideo: (videoId, videoName) =>
    set({
      stagedVideoId: videoId,
      stagedVideoName: videoName ?? "",
    }),

  setSubmitting: (v) => set({ isSubmitting: v }),

  setApplicationComplete: (v) => set({ applicationComplete: v }),

  reset: () =>
    set({
      step: 0,
      form: { ...initialForm },
      stagedVideoId: null,
      stagedVideoName: "",
      isSubmitting: false,
      applicationComplete: false,
    }),
}));
