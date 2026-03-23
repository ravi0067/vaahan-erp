// API helper utilities for frontend-to-backend communication

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(body.error || 'API error', res.status);
  }
  return res.json();
}

export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return handleResponse<T>(res);
}

export async function apiPost<T>(url: string, data: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<T>(res);
}

export async function apiPut<T>(url: string, data: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: 'DELETE' });
  return handleResponse<T>(res);
}
