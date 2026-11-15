import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const config = JSON.parse(readFileSync('vercel.json', 'utf8'))

describe('deployment security configuration', () => {
    it('keeps the SPA rewrite and declares the requested security headers', () => {
        expect(config.rewrites).toContainEqual({ source: '/(.*)', destination: '/index.html' })
        const headers = config.headers[0].headers
        const values = Object.fromEntries(headers.map(({ key, value }) => [key, value]))
        expect(values['Content-Security-Policy']).toContain("default-src 'self'; script-src 'self'")
        expect(values['Content-Security-Policy']).toContain("frame-ancestors 'none'; base-uri 'self'; form-action 'self'")
        expect(values['X-Content-Type-Options']).toBe('nosniff')
        expect(values['X-Frame-Options']).toBe('DENY')
        expect(values['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
        expect(values['Permissions-Policy']).toBe('camera=(), microphone=(), geolocation=()')
    })
})
