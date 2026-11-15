import { webcrypto } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { constantTimeEqual, createPasscodeGuard, getDemoCredential, hashPasscode } from './security.js'

describe('passcode security', () => {
    it('hashes the demo passcode with its salt and does not store it in plaintext', async () => {
        const { passcodeHash, passcodeSalt } = getDemoCredential()
        expect(await hashPasscode('123456', passcodeSalt, webcrypto)).toBe(passcodeHash)
        expect(passcodeHash).not.toContain('123456')
        expect(constantTimeEqual(passcodeHash, await hashPasscode('000000', passcodeSalt, webcrypto))).toBe(false)
    })

    it('locks after five failures and permits checking after sixty seconds', async () => {
        let now = 1_000
        const guard = createPasscodeGuard({ verify: async (value) => value === '123456', now: () => now })
        for (let attempt = 0; attempt < 4; attempt += 1) {
            expect((await guard.check('wrong')).attemptsRemaining).toBe(4 - attempt)
        }
        const locked = await guard.check('wrong')
        expect(locked.lockedUntil).toBe(61_000)
        expect(await guard.check('123456')).toMatchObject({ ok: false, lockedUntil: 61_000 })
        now = 61_001
        expect(await guard.check('123456')).toMatchObject({ ok: true, attemptsRemaining: 5 })
    })

    it('restores a pending lockout from session storage after guard recreation', async () => {
        let now = 5_000
        const values = new Map()
        const session = {
            getItem: (key) => values.get(key) ?? null,
            setItem: (key, value) => values.set(key, value),
            removeItem: (key) => values.delete(key),
        }
        const options = { verify: async () => false, now: () => now, storage: session, key: 'lockout-test' }
        const firstGuard = createPasscodeGuard(options)
        for (let attempt = 0; attempt < 5; attempt += 1) await firstGuard.check('wrong')
        const afterReload = createPasscodeGuard({ ...options, verify: async () => true })
        expect(await afterReload.check('123456')).toMatchObject({ ok: false, lockedUntil: 65_000 })
        now = 65_001
        expect(await afterReload.check('123456')).toMatchObject({ ok: true })
    })
})
