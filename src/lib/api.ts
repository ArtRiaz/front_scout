import type { RegistrationPayload } from "@/types";

function getApiBase(): string {
  const trimEnd = (s: string) => s.replace(/\/+$/, "");
  const envUrl =
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_PROXY_ORIGIN?.trim();
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

export async function stageVideo(telegramUserId: number, file: File) {
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

export async function submitVideo(telegramUserId: number, videoId: string) {
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
    staged_video_id?: string | null;
    social_flow_completed?: boolean;
    has_agent_registration?: boolean;
  }>(`/api/status/${telegramUserId}`);
}

export async function registerAgent(data: {
  telegram_user_id: number;
  first_name: string;
  last_name: string;
  country: string;
  agent_role: "agent" | "scout" | "academy";
}) {
  return request<{
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    country: string;
    agent_role: string;
    players_count: number;
    created_at: string;
  }>("/api/agent/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAgentProfile(telegramUserId: number) {
  return request<{
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    country: string;
    agent_role: string;
    players_count: number;
    created_at: string;
  }>(`/api/agent/profile/${telegramUserId}`);
}

export async function createAgentPlayer(
  data: {
    telegram_user_id: number;
    first_name: string;
    last_name: string;
    height_cm: number;
    weight_kg: number;
    position: string;
    dominant_foot: "left" | "right" | "both";
    country: string;
    current_club: string | null;
    free_agent: boolean;
    file: File;
  },
  onProgress?: (percent: number) => void,
): Promise<{
  player_id: string;
  players_count: number;
  min_required: number;
  max_allowed: number;
}> {
  const formData = new FormData();
  formData.append("telegram_user_id", String(data.telegram_user_id));
  formData.append("first_name", data.first_name);
  formData.append("last_name", data.last_name);
  formData.append("height_cm", String(data.height_cm));
  formData.append("weight_kg", String(data.weight_kg));
  formData.append("position", data.position);
  formData.append("dominant_foot", data.dominant_foot);
  formData.append("country", data.country);
  formData.append("current_club", data.current_club ?? "");
  formData.append("free_agent", String(data.free_agent));
  formData.append("file", data.file);

  const base = getApiBase();
  const url = `${base}/api/agent/players`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.responseType = "text";
    xhr.timeout = 15 * 60 * 1000; // 15 minutes — allow slow mobile uploads

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable && evt.total > 0) {
          const pct = Math.round((evt.loaded / evt.total) * 100);
          onProgress(pct);
        }
      };
    }

    xhr.onload = () => {
      const status = xhr.status;
      const text = xhr.responseText || "";
      let body: Record<string, unknown> = {};
      try {
        body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
      } catch {
        body = {};
      }
      if (status >= 200 && status < 300) {
        resolve(
          body as unknown as {
            player_id: string;
            players_count: number;
            min_required: number;
            max_allowed: number;
          },
        );
      } else {
        const detail =
          typeof body.detail === "string"
            ? body.detail
            : `Create player failed: ${status}`;
        reject(new Error(detail));
      }
    };
    xhr.onerror = () => reject(new Error("Network error while uploading video"));
    xhr.onabort = () => reject(new Error("Upload aborted"));
    xhr.ontimeout = () => reject(new Error("Upload timed out"));

    xhr.send(formData);
  });
}

export async function initiateAgentCheckout(data: {
  telegram_user_id: number;
  submission_type: "standard" | "priority";
}) {
  return request<{
    payment_id: string;
    status: string;
    players_count: number;
    submission_type: string;
    unit_price: number;
    total_stars: number;
    currency: string;
    invoice_link: string;
    invoice_payload: string;
  }>("/api/agent/checkout/initiate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getSocialConfig() {
  return request<{
    instagram_url: string;
    telegram_channel_url: string;
  }>("/api/social/config");
}

export async function confirmInstagram(telegramUserId: number) {
  return request<{
    instagram_done: boolean;
    telegram_done: boolean;
    all_done: boolean;
  }>("/api/social/instagram/confirm", {
    method: "POST",
    body: JSON.stringify({ telegram_user_id: telegramUserId }),
  });
}

export async function checkTelegram(telegramUserId: number) {
  return request<{
    instagram_done: boolean;
    telegram_done: boolean;
    all_done: boolean;
  }>("/api/social/telegram/check", {
    method: "POST",
    body: JSON.stringify({ telegram_user_id: telegramUserId }),
  });
}

export async function getSocialStatus(telegramUserId: number) {
  return request<{
    instagram_done: boolean;
    telegram_done: boolean;
    all_done: boolean;
  }>(`/api/social/status/${telegramUserId}`);
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
