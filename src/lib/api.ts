import type { RegistrationPayload } from "@/types";

/** Resolve API host on each call so ?api= from Telegram WebApp URL is always used. */
function getApiBase(): string {
  const trimEnd = (s: string) => s.replace(/\/+$/, "");
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (envUrl) return trimEnd(envUrl);
  if (typeof window !== "undefined") {
    const fromQuery = new URLSearchParams(window.location.search).get("api")?.trim();
    if (fromQuery) return trimEnd(fromQuery);
  }
  return "";
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const base = getApiBase();
  const res = await fetch(`${base}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }

  return res.json();
}

export async function registerUser(data: RegistrationPayload) {
  return request<{ id: string; status: string; created_at?: string }>(
    "/api/register",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export async function getPaymentInfo() {
  return request<{ amount: number; currency: string }>("/api/payment/info");
}

export async function initiatePayment(telegramUserId: number) {
  return request<{
    payment_id: string;
    status: string;
    amount: number;
    currency: string;
    invoice_link: string;
    invoice_payload: string;
  }>("/api/payment/initiate", {
    method: "POST",
    body: JSON.stringify({ telegram_user_id: telegramUserId }),
  });
}

export async function stageVideo(
  telegramUserId: number,
  file: File,
) {
  const formData = new FormData();
  formData.append("telegram_user_id", String(telegramUserId));
  formData.append("file", file);

  const base = getApiBase();
  const res = await fetch(`${base}/api/video/stage`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Stage upload failed: ${res.status}`);
  }

  return res.json() as Promise<{
    video_id: string;
    file_url: string;
    status: string;
  }>;
}

export async function submitVideo(
  telegramUserId: number,
  videoId: string,
) {
  return request<{
    video_id: string;
    file_url: string;
    status: string;
  }>("/api/video/submit", {
    method: "POST",
    body: JSON.stringify({ telegram_user_id: telegramUserId, video_id: videoId }),
  });
}

export async function getStatus(telegramUserId: number) {
  return request<{
    telegram_user_id: number;
    status: string;
    has_registration: boolean;
    has_payment: boolean;
    has_video: boolean;
  }>(`/api/status/${telegramUserId}`);
}

export async function trackEvent(
  telegramUserId: number,
  event_type: string,
  metadata?: Record<string, unknown>,
) {
  return request<{ ok: boolean }>("/api/event", {
    method: "POST",
    body: JSON.stringify({
      telegram_user_id: telegramUserId,
      event_type,
      metadata,
    }),
  });
}
