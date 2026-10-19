import { api } from '@/api/client'
import type { Member, MemberRole } from './types'

export type MemberInput = {
  name: string
  gender?: string
  age?: number | null
  birthday?: string
  workstation?: string
  major?: string
  grade?: string
  college?: string
  education?: string
  email?: string
  phone?: string
  id_card?: string
  workstation_desc?: string
  tech_stack?: string
  role?: MemberRole
  password?: string
}

export type LoginMember = {
  id: string
  name: string
  workstation: string
  has_password: boolean
}

export async function listLoginMembers(): Promise<LoginMember[]> {
  return api<LoginMember[]>('/api/auth/login-members')
}

export async function listMembers(): Promise<Member[]> {
  return api<Member[]>('/api/members')
}

export async function getMember(id: string): Promise<Member | null> {
  try {
    return await api<Member>(`/api/members/${id}`)
  } catch {
    return null
  }
}

export async function createMember(input: MemberInput): Promise<Member> {
  return api<Member>('/api/members', { method: 'POST', body: JSON.stringify(input) })
}

export async function updateMember(id: string, input: MemberInput): Promise<Member> {
  return api<Member>(`/api/members/${id}`, { method: 'PUT', body: JSON.stringify(input) })
}

export async function deleteMember(id: string): Promise<void> {
  await api<boolean>(`/api/members/${id}`, { method: 'DELETE' })
}
