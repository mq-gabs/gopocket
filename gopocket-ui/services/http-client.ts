export interface ApiResponse<T> {
  status: boolean;
  data?: T;
  error?: string;
  /** Stable identifier the frontend translates instead of showing `error` directly. */
  key?: string;
}

export class HttpError extends Error {
  /** Matches ApiResponse.key — see utils/api-error.ts for the translation lookup. */
  key?: string;

  constructor(message: string, key?: string) {
    super(message);
    this.name = "HttpError";
    this.key = key;
  }
}

export const getApiBaseUrl = (): string =>
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080";

async function unwrap<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || payload.status === false) {
    throw new HttpError(payload.error ?? "Request failed", payload.key);
  }

  return payload.data as T;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  return unwrap<T>(response);
}

// Posts a FormData body without forcing a JSON Content-Type header, so the
// browser can set its own multipart boundary.
async function requestForm<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    body: formData,
  });

  return unwrap<T>(response);
}

export const httpClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T, D = unknown>(path: string, body: D) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  postForm: <T>(path: string, formData: FormData) => requestForm<T>(path, formData),
  put: <T, D = unknown>(path: string, body: D) => request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T, D = unknown>(path: string, body: D) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T, D = unknown>(path: string, body?: D) =>
    request<T>(path, {
      method: "DELETE",
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),
};
