import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import HomePage from './HomePage.jsx'
import { storage, today } from '../lib/storage.js'

beforeEach(() => {
    localStorage.clear()
    storage.reset()
    storage.setRole('Elder')
})

describe('elder home check-in', () => {
    it('saves the I took it dose action for today', async () => {
        const user = userEvent.setup()
        render(<MemoryRouter><HomePage /></MemoryRouter>)
        await user.click(screen.getByRole('button', { name: /i took it/i }))
        expect(storage.getSnapshot().doseLogs.find((log) => log.medicineId === 'med-aspirin' && log.date === today())?.status).toBe('taken')
        expect(await screen.findByRole('heading', { level: 3, name: 'Lisinopril' })).toBeInTheDocument()
    })
})
