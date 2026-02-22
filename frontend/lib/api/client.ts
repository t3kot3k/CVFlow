import { getIdToken } from "@/lib/firebase";

// Use a relative URL so all requests go through the Next.js dev proxy (no CORS).
// In production, configure a reverse proxy (nginx etc.) for /api/v1 → backend.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "/api/v1";

interface RequestOptions extends RequestInit {
  authenticated?: boolean;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * On 401 / 403: only redirect to /login if Firebase session is truly gone.
 * Transient 401/403 from the API (timing, proxy, etc.) won't force a redirect
 * when the user is still authenticated in Firebase.
 */
function handleAuthError(): void {
  if (typeof window === "undefined") return;
  import("@/lib/firebase")
    .then(({ auth }) => {
      if (!auth.currentUser) {
        window.location.href = "/login";
      }
      // User still authenticated → let the error propagate to the caller's .catch()
    })
    .catch(() => {});
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { authenticated = true, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (authenticated) {
    try {
      const token = await getIdToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Failed to get auth token:", error);
    }
  }

  // Only set Content-Type for JSON string bodies
  if (fetchOptions.body && typeof fetchOptions.body === "string") {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });
  } catch {
    throw new ApiError(
      "Impossible de contacter le serveur. Vérifiez votre connexion.",
      0
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Session expired or invalid → redirect to login
    if (response.status === 401 || response.status === 403) {
      handleAuthError();
    }
    const detail = data?.detail;
    const message =
      typeof detail === "string" ? detail
      : Array.isArray(detail) ? detail.map((e: { msg?: string }) => e?.msg ?? JSON.stringify(e)).join("; ")
      : detail ? JSON.stringify(detail)
      : "Une erreur est survenue";
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

/** Download a file response (PDF, DOCX…) */
async function download(
  endpoint: string,
  options: RequestOptions = {}
): Promise<Blob> {
  const { authenticated = true, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (authenticated) {
    try {
      const token = await getIdToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      console.error("Failed to get auth token:", error);
    }
  }

  if (fetchOptions.body && typeof fetchOptions.body === "string") {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    throw new ApiError(
      `Impossible de contacter le serveur. (${errMsg})`,
      0
    );
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    if (response.status === 401 || response.status === 403) {
      handleAuthError();
    }
    const detail = data?.detail;
    const message =
      typeof detail === "string" ? detail
      : Array.isArray(detail) ? detail.map((e: { msg?: string }) => e?.msg ?? JSON.stringify(e)).join("; ")
      : detail ? JSON.stringify(detail)
      : "Download failed";
    throw new ApiError(message, response.status, data);
  }

  return response.blob();
}

export { request, download, API_BASE_URL };
