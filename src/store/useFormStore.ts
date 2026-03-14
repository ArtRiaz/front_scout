import { create } from "zustand";
import type { FormData, Step } from "@/types";

interface FormStore {
  step: Step;
  form: FormData;
  videoFile: File | null;
  videoName: string;
  isSubmitting: boolean;
  setStep: (step: Step) => void;
  updateForm: (field: keyof FormData, value: string | boolean) => void;
  setVideoFile: (file: File | null) => void;
  setSubmitting: (v: boolean) => void;
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
  videoFile: null,
  videoName: "",
  isSubmitting: false,

  setStep: (step) => set({ step }),

  updateForm: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

  setVideoFile: (file) =>
    set({ videoFile: file, videoName: file?.name ?? "" }),

  setSubmitting: (v) => set({ isSubmitting: v }),

  reset: () =>
    set({
      step: 0,
      form: { ...initialForm },
      videoFile: null,
      videoName: "",
      isSubmitting: false,
    }),
}));
