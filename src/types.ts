export interface FormData {
  fullName: string;
  age: string;
  country: string;
  city: string;
  whatsappPhone: string;
  email: string;
  position: string;
  dominantFoot: string;
  heightCm: string;
  weightKg: string;
  currentClub: string;
  freeAgent: boolean;
  shortAbout: string;
  consentTerms: boolean;
}

export interface RegistrationPayload {
  telegram_user_id: number;
  full_name: string;
  age: number;
  country: string;
  city: string;
  whatsapp_phone: string;
  email: string | null;
  position: string;
  dominant_foot: string;
  height_cm: number;
  weight_kg: number;
  current_club: string | null;
  free_agent: boolean;
  short_about: string | null;
  consent_terms: boolean;
  consent_updates: boolean;
}

export type Step = 0 | 1 | 2;

export const STEPS = [
  { label: "Registration", number: 1 },
  { label: "Video", number: 2 },
  { label: "Payment", number: 3 },
] as const;

export const COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Cameroon",
  "Senegal",
  "South Africa",
  "Côte d'Ivoire",
  "Egypt",
  "Morocco",
  "Kenya",
  "Tanzania",
  "Uganda",
  "DR Congo",
  "Mali",
  "Guinea",
  "Burkina Faso",
  "Zambia",
  "Zimbabwe",
  "Tunisia",
  "Algeria",
  "Angola",
  "Benin",
  "Togo",
  "Sierra Leone",
  "Liberia",
  "Rwanda",
  "Ethiopia",
  "Mozambique",
  "Other",
] as const;

export const POSITIONS = [
  "Goalkeeper",
  "Centre-Back",
  "Left-Back",
  "Right-Back",
  "Defensive Midfielder",
  "Central Midfielder",
  "Attacking Midfielder",
  "Left Winger",
  "Right Winger",
  "Striker",
  "Centre-Forward",
] as const;

export const DOMINANT_FEET = [
  { value: "right", label: "Right" },
  { value: "left", label: "Left" },
  { value: "both", label: "Both" },
] as const;
