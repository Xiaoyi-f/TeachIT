export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function saltNow(): string {
  return Math.random().toString(36).slice(2, 12)
}

export function hashPassword(password: string, salt: string): string {
  let h = 0
  const str = `${salt}:${password}`
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return `h${Math.abs(h).toString(16)}`
}

export function createPassword(password: string): { hash: string; salt: string } {
  const salt = saltNow()
  return { hash: hashPassword(password, salt), salt }
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  return hashPassword(password, salt) === hash
}
