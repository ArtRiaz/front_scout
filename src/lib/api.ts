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
  whatsapp_phone: string;
}) {
  return request<{
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    country: string;
    agent_role: string;
    whatsapp_phone?: string | null;
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
    whatsapp_phone?: string | null;
    players_count: number;
    paid_players_count?: number;
    created_at: string;
  }>(`/api/agent/profile/${telegramUserId}`);
}

interface CreateAgentPlayerData {
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
}

interface CreateAgentPlayerResponse {
  player_id: string;
  players_count: number;
  min_required: number;
  max_allowed: number;
}

function uploadAgentPlayerOnce(
  data: CreateAgentPlayerData,
  url: string,
  attemptNumber: number,
  onProgress?: (percent: number) => void,
): Promise<CreateAgentPlayerResponse> {
  // Rebuild FormData per attempt: a previously-aborted XHR may have
  // partially consumed the underlying Blob streams in some WebKit
  // builds, which would make the next send() fail in the same way.
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

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.responseType = "text";
    xhr.timeout = 15 * 60 * 1000; // 15 minutes — allow slow mobile uploads

    let lastLoaded = 0;
    let lastTotal = 0;
    const startedAt = Date.now();

    if (xhr.upload) {
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable && evt.total > 0) {
          lastLoaded = evt.loaded;
          lastTotal = evt.total;
          if (onProgress) {
            const pct = Math.round((evt.loaded / evt.total) * 100);
            onProgress(pct);
          }
        }
      };
      xhr.upload.onerror = () => {
        // Surfaced via xhr.onerror below; keep handler so iOS does not
        // bubble an unhandled error event.
      };
      xhr.upload.onabort = () => {
        // Same.
      };
    }

    const buildDiag = (label: string) => {
      const elapsed = Date.now() - startedAt;
      return (
        `[upload ${label} attempt=${attemptNumber}] ` +
        `rs=${xhr.readyState} st=${xhr.status} ` +
        `sent=${lastLoaded}/${lastTotal || data.file.size}B ` +
        `elapsed=${elapsed}ms`
      );
    };

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
        resolve(body as unknown as CreateAgentPlayerResponse);
      } else {
        const detail =
          typeof body.detail === "string"
            ? body.detail
            : `Create player failed: ${status}`;
        reject(new Error(`${detail} ${buildDiag("http_error")}`));
      }
    };
    xhr.onerror = () => reject(new Error(`Network error ${buildDiag("error")}`));
    xhr.onabort = () => reject(new Error(`Upload aborted ${buildDiag("abort")}`));
    xhr.ontimeout = () =>
      reject(new Error(`Upload timed out ${buildDiag("timeout")}`));

    try {
      xhr.send(formData);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      reject(new Error(`xhr.send threw: ${msg} ${buildDiag("send_throw")}`));
    }
  });
}

export async function createAgentPlayer(
  data: CreateAgentPlayerData,
  onProgress?: (percent: number) => void,
): Promise<CreateAgentPlayerResponse> {
  // iOS Telegram WebView intermittently aborts multipart POSTs at the
  // TLS layer (status=0 with sub-100ms duration) after the app has been
  // backgrounded or after a network handoff. The server never sees the
  // request. Auto-retry on transient errors only — never on real HTTP
  // 4xx/5xx replies, which mean the body actually reached FastAPI.
  const TRANSIENT_RE = /\[upload (error|abort|timeout|send_throw)/;
  const RETRY_DELAYS_MS = [0, 800, 2500];

  const base = getApiBase();
  const url = `${base}/api/agent/players`;

  let lastError: unknown;
  for (let attempt = 1; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    const delay = RETRY_DELAYS_MS[attempt - 1];
    if (delay > 0) {
      await new Promise((r) => setTimeout(r, delay));
      // Reset progress for the next attempt so the UI doesn't pretend
      // the upload is at 80% when it actually starts from zero again.
      onProgress?.(0);
    }
    try {
      return await uploadAgentPlayerOnce(data, url, attempt, onProgress);
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (!TRANSIENT_RE.test(msg)) {
        // Real HTTP error from the backend (validation, 413, 500…).
        // Bubble immediately, retrying would just make duplicates if
        // the server happens to recover.
        throw err;
      }
    }
  }
  throw lastError;
}

export async function getAgentPaymentStatus(
  telegramUserId: number,
  paymentId: string,
) {
  return request<{ payment_id: string; status: string }>(
    `/api/agent/checkout/status/${telegramUserId}/${paymentId}`,
  );
}

export async function getAgentPrices() {
  return request<{ standard: number; priority: number; currency: string }>(
    "/api/agent/prices",
  );
}

export interface AgentBatchPlayer {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  height_cm: number;
  weight_kg: number;
  country: string;
  current_club: string | null;
  free_agent: boolean;
  video_file_url: string | null;
  created_at: string;
}

export async function listAgentBatchPlayers(telegramUserId: number) {
  return request<AgentBatchPlayer[]>(`/api/agent/players/${telegramUserId}`);
}

export async function deleteAgentBatchPlayer(
  telegramUserId: number,
  playerId: string,
) {
  return request<{ ok: boolean; players_count: number }>(
    `/api/agent/players/${telegramUserId}/${playerId}`,
    { method: "DELETE" },
  );
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
