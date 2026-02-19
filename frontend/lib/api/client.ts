import { getIdToken } from "@/lib/firebase";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8066/api/v1";

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
 * On 401 / 403: sign out Firebase and redirect to /login.
 * Fire-and-forget (no await needed at call site).
 */
function handleAuthError(): void {
  if (typeof window === "undefined") return;
  // Lazy import avoids circular dependency
  import("@/lib/firebase").then(({ logOut }) => logOut()).catch(() => {});
  window.location.href = "/login";
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
    throw new ApiError(
      data?.detail || "Une erreur est survenue",
      response.status,
      data
    );
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
    const token = await getIdToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    if (response.status === 401 || response.status === 403) {
      handleAuthError();
    }
    throw new ApiError(data?.detail || "Download failed", response.status, data);
  }

  return response.blob();
}

export { request, download, API_BASE_URL };
