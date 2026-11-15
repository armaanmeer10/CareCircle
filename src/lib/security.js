const DEMO_SALT = '91f2d89ce40a7b13dd6406b2ac571a95'
const DEMO_PASSCODE_HASH = 'c6e49148f772c32f9a6a2dc76b758f562ed91ee3445e6e6845475a65c24fd88b'
const DEMO_PASSCODE = '123456'

/** Hash a passcode with its salt using the browser's SHA-256 Web Crypto API. */
export async function hashPasscode(passcode, salt, cryptoProvider = globalThis.crypto) {
    if (!cryptoProvider?.subtle) {
        throw new Error('Secure passcode verification is unavailable in this browser.')
    }
    const digest = await cryptoProvider.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(`carecircle:${salt}:${String(passcode)}`),
    )
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/** Compare fixed-size digest strings without stopping at the first differing byte. */
export function constantTimeEqual(left, right) {
    if (typeof left !== 'string' || typeof right !== 'string') return false
    const length = Math.max(left.length, right.length)
    let difference = left.length ^ right.length
    for (let index = 0; index < length; index += 1) {
        difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0)
    }
    return difference === 0
}

/** Return a salted, one-way credential for the public local demo passcode. */
export function getDemoCredential() {
    return { passcodeSalt: DEMO_SALT, passcodeHash: DEMO_PASSCODE_HASH }
}

/** Return the public sample passcode for the access and invitation UI only. */
export function getDemoPasscode() {
    return DEMO_PASSCODE
}

/** Create a testable passcode attempt guard with a temporary lockout. */
export function createPasscodeGuard({ verify, maxAttempts = 5, lockoutMs = 60_000, now = Date.now, storage = null, key = 'carecircle.passcode-lockout' }) {
    let failedAttempts = 0
    let lockedUntil = 0

    function persist() {
        try {
            if (storage) storage.setItem(key, JSON.stringify({ failedAttempts, lockedUntil }))
        } catch {
            // The guard remains active for this page session if browser storage is unavailable.
        }
    }

    try {
        const saved = storage?.getItem(key)
        if (saved) {
            const parsed = JSON.parse(saved)
            if (Number.isInteger(parsed.failedAttempts) && parsed.failedAttempts >= 0 && parsed.failedAttempts < maxAttempts
                && Number.isFinite(parsed.lockedUntil) && parsed.lockedUntil >= 0) {
                failedAttempts = parsed.failedAttempts
                lockedUntil = parsed.lockedUntil
            }
        }
    } catch {
        failedAttempts = 0
        lockedUntil = 0
    }

    return {
        async check(passcode) {
            const currentTime = now()
            if (currentTime < lockedUntil) {
                return { ok: false, lockedUntil, attemptsRemaining: 0 }
            }
            if (lockedUntil) lockedUntil = 0

            if (await verify(passcode)) {
                failedAttempts = 0
                lockedUntil = 0
                persist()
                return { ok: true, lockedUntil: 0, attemptsRemaining: maxAttempts }
            }

            failedAttempts += 1
            if (failedAttempts >= maxAttempts) {
                failedAttempts = 0
                lockedUntil = currentTime + lockoutMs
                persist()
                return { ok: false, lockedUntil, attemptsRemaining: 0 }
            }
            persist()
            return { ok: false, lockedUntil: 0, attemptsRemaining: maxAttempts - failedAttempts }
        },
        getLockedUntil() {
            return lockedUntil > now() ? lockedUntil : 0
        },
        reset() {
            failedAttempts = 0
            lockedUntil = 0
            try {
                storage?.removeItem(key)
            } catch {
                // Ignore storage failures; in-memory lockout state is still reset.
            }
        },
    }
}
