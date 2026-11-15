import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storage } from './storage.js'
import { useCurrentNotice, useData, useNotice } from './useData.js'

function DataProbe() {
    const data = useData()
    return <p>{data.profile.name}</p>
}

function NoticeProbe() {
    const message = useCurrentNotice()
    const announce = useNotice()
    return <div><button onClick={() => announce('Saved safely.')}>Announce</button><p role="status">{message}</p></div>
}

beforeEach(() => {
    localStorage.clear()
    storage.reset()
})

afterEach(() => vi.useRealTimers())

describe('shared React data and notice hooks', () => {
    it('subscribes to storage updates', () => {
        render(<DataProbe />)
        act(() => storage.update((current) => ({ ...current, profile: { ...current.profile, name: 'Alex' } })))
        expect(screen.getByText('Alex')).toBeInTheDocument()
    })

    it('announces notices and clears them after the timeout', () => {
        vi.useFakeTimers()
        render(<NoticeProbe />)
        act(() => screen.getByRole('button', { name: 'Announce' }).click())
        expect(screen.getByRole('status')).toHaveTextContent('Saved safely.')
        act(() => vi.advanceTimersByTime(3200))
        expect(screen.getByRole('status')).toBeEmptyDOMElement()
    })
})
