import { api } from '@/api/client'

/** 检查服务端 SQLite API 是否可用。 */
export async function initDatabase(): Promise<void> {
  await api<{ status: string }>('/api/health')
}
