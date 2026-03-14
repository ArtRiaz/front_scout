import type { RegistrationPayload } from "@/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("api") || ""
    : "");

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
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
  return request<{ id: string; status: string }>("/api/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function initiatePayment(telegramUserId: number) {
  return request<{
    payment_id: string;
    status: string;
    amount: number;
    currency: string;
  }>("/api/payment/initiate", {
    method: "POST",
    body: JSON.stringify({ telegram_user_id: telegramUserId }),
  });
}

export async function uploadVideo(telegramUserId: number, file: File) {
  const formData = new FormData();
  formData.append("telegram_user_id", String(telegramUserId));
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/video/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Upload failed: ${res.status}`);
  }

  return res.json() as Promise<{
    video_id: string;
    file_url: string;
    status: string;
  }>;
}
