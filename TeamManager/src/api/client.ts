export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string }

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const res = await fetch(path, {
    ...init,
    headers,
    credentials: 'include',
  })
  let payload: ApiResult<T> | null = null
  try {
    payload = (await res.json()) as ApiResult<T>
  } catch {
    throw new ApiError(res.statusText || '请求失败', res.status)
  }
  if (!payload || !('ok' in payload)) {
    throw new ApiError('响应格式错误', res.status)
  }
  if (!payload.ok) {
    throw new ApiError(payload.error || '请求失败', res.status)
  }
  return payload.data
}
