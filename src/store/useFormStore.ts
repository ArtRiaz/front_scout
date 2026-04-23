import { create } from "zustand";
import type { FormData, Step } from "@/types";

export type FlowKind = "player" | "agent";
export type AgentSubStep = "register" | "summary" | "players" | "payment";

export interface AgentProfileSnapshot {
  firstName: string;
  lastName: string;
  country: string;
  agentRole: string;
  playersAdded: number;
}

export interface AgentCheckoutSnapshot {
  submissionType: "standard" | "priority";
  unitPrice: number;
  totalStars: number;
}

interface FormStore {
  step: Step;
  form: FormData;
  stagedVideoId: string | null;
  stagedVideoName: string;
  isSubmitting: boolean;
  /** Set when user already finished video submit + payment (resume shows thank-you). */
  applicationComplete: boolean;
  /** Player vs agent onboarding (agent is EN-only in UI). */
  flowKind: FlowKind;
  agentSubStep: AgentSubStep;
  agentProfile: AgentProfileSnapshot | null;
  agentCheckout: AgentCheckoutSnapshot | null;
  setStep: (step: Step) => void;
  updateForm: (field: keyof FormData, value: string | boolean) => void;
  setStagedVideo: (videoId: string | null, videoName?: string) => void;
  setSubmitting: (v: boolean) => void;
  setApplicationComplete: (v: boolean) => void;
  setFlowKind: (k: FlowKind) => void;
  setAgentSubStep: (s: AgentSubStep) => void;
  setAgentProfile: (p: AgentProfileSnapshot | null) => void;
  setAgentCheckout: (p: AgentCheckoutSnapshot | null) => void;
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
  flowKind: "player",
  agentSubStep: "register",
  agentProfile: null,
  agentCheckout: null,

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

  setFlowKind: (k) => set({ flowKind: k }),

  setAgentSubStep: (s) => set({ agentSubStep: s }),

  setAgentProfile: (p) => set({ agentProfile: p }),
  setAgentCheckout: (p) => set({ agentCheckout: p }),

  reset: () =>
    set({
      step: 0,
      form: { ...initialForm },
      stagedVideoId: null,
      stagedVideoName: "",
      isSubmitting: false,
      applicationComplete: false,
      flowKind: "player",
      agentSubStep: "register",
      agentProfile: null,
      agentCheckout: null,
    }),
}));
