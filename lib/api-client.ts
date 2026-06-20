/**
 * Shared client-side API helper for tool endpoints.
 *
 * Why this exists:
 *   The five AI tool pages (listing / reply / review / holiday / batch) all POST
 *   to their own /api/<tool> endpoint and need *identical* error handling for:
 *     - 403 LIMIT_EXCEEDED  (free quota burned, must surface upgradeUrl)
 *     - 403 SUBSCRIPTION_EXPIRED
 *     - 429 RATE_LIMIT_EXCEEDED
 *     - 4xx INVALID_INPUT / 5xx AI_SERVICE_ERROR
 *     - network / JSON parse failures
 *
 *   Before the P0 fix the pages used a 3-second auto-dismiss toast that did NOT
 *   surface the upgrade CTA — for users sharing a NAT'd IP (office / coffee
 *   shop / school) the buttons looked completely dead. This helper returns a
 *   structured `ToolApiError` that the new <ApiErrorBanner /> component can
 *   render as a persistent banner with a real "Upgrade to Pro" button.
 */

export interface ToolApiError {
  /** Human-readable message safe to display in UI. Always set. */
  message: string;
  /** Backend error code, or HTTP_<status> / NETWORK_ERROR / PARSE_ERROR fallback. */
  code: string;
  /** When set, the banner renders an "Upgrade to Pro" CTA pointing here. */
  upgradeUrl?: string;
  /** When set, the banner renders a retry hint (seconds). */
  retryAfterSeconds?: number;
  /** Original HTTP status if we have one. */
  status?: number;
}

export type ToolApiResult<TData> =
  | { ok: true; data: TData }
  | { ok: false; error: ToolApiError };

interface BackendErrorShape {
  code?: string;
  message?: string;
  upgradeUrl?: string;
  retry_after_seconds?: number;
}

interface BackendEnvelope<TData> {
  success?: boolean;
  data?: TData;
  error?: BackendErrorShape;
}

function getStoredEmail(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem("sellermind_email") || "";
  } catch {
    return "";
  }
}

function buildFallbackMessage(status: number, code: string): string {
  if (status === 403 && code === "LIMIT_EXCEEDED") {
    return "You've used your 3 free uses this month. Upgrade to Pro for unlimited access.";
  }
  if (status === 403 && code === "SUBSCRIPTION_EXPIRED") {
    return "Your subscription has expired. Please renew to continue.";
  }
  if (status === 403) {
    return "Access denied. Upgrade to Pro to continue using this tool.";
  }
  if (status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }
  if (status >= 500) {
    return "Our AI service hit a temporary error. Please try again in a moment.";
  }
  if (status === 400) {
    return "Some of the inputs look invalid. Please review the form and try again.";
  }
  return `Request failed (${code}). Please try again.`;
}

/**
 * POST JSON to a tool endpoint and return a result that is *always* safe to
 * branch on (`result.ok`). The caller's email is auto-attached from
 * localStorage so individual pages don't need to remember.
 *
 * Behavior contract:
 *   - Non-2xx: result.ok === false, result.error populated.
 *   - 2xx but `{success:false}`: result.ok === false, result.error populated.
 *   - JSON parse failure: result.ok === false, code === "PARSE_ERROR".
 *   - Network failure: result.ok === false, code === "NETWORK_ERROR".
 *   - 2xx + `{success:true,data}`: result.ok === true, result.data === data.
 */
export async function callToolApi<TReq extends object, TData>(
  endpoint: string,
  payload: TReq
): Promise<ToolApiResult<TData>> {
  const email = getStoredEmail();
  // Spread is safe: TReq is constrained to object, and the API endpoints
  // tolerate (and in fact expect) an additional `email` field.
  const body = JSON.stringify({ ...(payload as Record<string, unknown>), email });

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch (e) {
    return {
      ok: false,
      error: {
        message:
          e instanceof Error && e.message
            ? `Network error: ${e.message}`
            : "Network error. Please check your connection and try again.",
        code: "NETWORK_ERROR",
      },
    };
  }

  let json: BackendEnvelope<TData> | null = null;
  try {
    json = (await response.json()) as BackendEnvelope<TData>;
  } catch {
    return {
      ok: false,
      error: {
        message: "We couldn't read the server response. Please try again.",
        code: "PARSE_ERROR",
        status: response.status,
      },
    };
  }

  // Backend explicitly signaled failure (incl. our 403 LIMIT_EXCEEDED case)
  // OR HTTP itself was non-2xx.
  if (!response.ok || json?.success === false) {
    const apiErr = json?.error ?? {};
    const code = apiErr.code || `HTTP_${response.status}`;
    return {
      ok: false,
      error: {
        message: apiErr.message || buildFallbackMessage(response.status, code),
        code,
        upgradeUrl: apiErr.upgradeUrl,
        retryAfterSeconds: apiErr.retry_after_seconds,
        status: response.status,
      },
    };
  }

  if (json?.data === undefined) {
    return {
      ok: false,
      error: {
        message: "The server returned an empty response. Please try again.",
        code: "EMPTY_RESPONSE",
        status: response.status,
      },
    };
  }

  return { ok: true, data: json.data };
}
