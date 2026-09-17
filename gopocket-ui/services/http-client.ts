export interface ApiResponse<T> {
  status: boolean;
  data?: T;
  error?: string;
}

export class HttpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HttpError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080"}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || payload.status === false) {
    throw new HttpError(payload.error ?? "Request failed");
  }

  return payload.data as T;
}

export const httpClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T, D = unknown>(path: string, body: D) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T, D = unknown>(path: string, body: D) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T, D = unknown>(path: string, body?: D) =>
    request<T>(path, {
      method: "DELETE",
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),
};
