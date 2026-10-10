// Cliente HTTP del API propio. La sesión viaja en una cookie httpOnly.

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any,
  ) {
    super(message);
  }
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const isForm = body instanceof FormData;
  const res = await fetch(`/api${url}`, {
    method,
    credentials: 'include',
    headers: body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? 'Error de conexión', data.details);
  return data as T;
}

export const api = {
  get: <T>(url: string) => request<T>('GET', url),
  post: <T>(url: string, body?: unknown) => request<T>('POST', url, body),
  put: <T>(url: string, body?: unknown) => request<T>('PUT', url, body),
  patch: <T>(url: string, body?: unknown) => request<T>('PATCH', url, body),
  delete: (url: string) => request<void>('DELETE', url),
};

export async function uploadImages(files: FileList | File[]): Promise<string[]> {
  const form = new FormData();
  Array.from(files).forEach((f) => form.append('files', f));
  const { urls } = await api.post<{ urls: string[] }>('/uploads', form);
  return urls;
}

export function errorMessage(err: unknown) {
  if (err instanceof ApiError) {
    if (err.details && typeof err.details === 'object') {
      const first = Object.values(err.details).flat()[0];
      if (typeof first === 'string') return first;
    }
    return err.message;
  }
  return 'No se pudo conectar con el servidor';
}
