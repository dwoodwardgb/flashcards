import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options?: { N?: number; r?: number; p?: number; maxmem?: number },
) => Promise<Buffer>

const IS_BUN = typeof process.versions.bun === 'string'

const SCRYPT_N = 16384
const SCRYPT_R = 8
const SCRYPT_P = 1
const KEY_LENGTH = 64

/**
 * Hashes a password with bcrypt via Bun's native `Bun.password`. The `remix
 * test` runner executes under Node, where `Bun.password` is unavailable, so
 * tests fall back to scrypt from `node:crypto` (self-describing hash format).
 */
export async function hashPassword(password: string): Promise<string> {
  if (IS_BUN) {
    return Bun.password.hash(password, { algorithm: 'bcrypt', cost: 10 })
  }

  let salt = randomBytes(16)
  let hash = await scryptAsync(password, salt, KEY_LENGTH)
  return `scrypt:${SCRYPT_N}:${SCRYPT_R}:${SCRYPT_P}:${salt.toString('base64')}:${hash.toString('base64')}`
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (hash.startsWith('scrypt:')) {
    let [, n, r, p, salt, expected] = hash.split(':')
    let derived = await scryptAsync(password, Buffer.from(salt, 'base64'), KEY_LENGTH, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    })
    return timingSafeEqual(derived, Buffer.from(expected, 'base64'))
  }

  if (!IS_BUN) {
    throw new Error('Cannot verify bcrypt password hashes outside Bun')
  }
  return Bun.password.verify(password, hash)
}
