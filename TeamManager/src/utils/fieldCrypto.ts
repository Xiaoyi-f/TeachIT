import { AES, enc } from 'crypto-js'

const IDB_NAME = 'teammanager-cipher'
const IDB_STORE = 'keys'
const KEY_ID = 'aes-passphrase'
const PREFIX = 'enc1:'

let secret = ''

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/** 生成并记住字段加密口令。口令与 SQLite 分开存放。 */
export async function initFieldCrypto(): Promise<void> {
  if (secret) return
  const db = await openIdb()
  secret = await new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite')
    const store = tx.objectStore(IDB_STORE)
    const get = store.get(KEY_ID)
    get.onerror = () => reject(get.error)
    get.onsuccess = () => {
      const existing = get.result
      if (typeof existing === 'string' && existing) {
        resolve(existing)
        return
      }
      const bytes = new Uint8Array(32)
      crypto.getRandomValues(bytes)
      const created = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
      store.put(created, KEY_ID)
      tx.oncomplete = () => resolve(created)
      tx.onerror = () => reject(tx.error)
    }
  })
}

/** AES 加密后写入数据库。空字符串保持为空。 */
export function encryptText(value: string): string {
  if (!value) return ''
  if (value.startsWith(PREFIX)) return value
  if (!secret) throw new Error('加密尚未初始化')
  return PREFIX + AES.encrypt(value, secret).toString()
}

/** 从数据库读出后解密，供界面显示。 */
export function decryptText(value: string): string {
  if (!value) return ''
  if (!value.startsWith(PREFIX)) return value
  if (!secret) return ''
  try {
    return AES.decrypt(value.slice(PREFIX.length), secret).toString(enc.Utf8)
  } catch {
    return ''
  }
}

export function isEncrypted(value: string): boolean {
  return value.startsWith(PREFIX)
}
