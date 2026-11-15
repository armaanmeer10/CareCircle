import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { MedicinesPage } from './MedicinesPage.jsx'
import { storage } from '../lib/storage.js'

beforeEach(() => {
    localStorage.clear()
    storage.reset()
    storage.setRole('Caretaker')
})

function renderMedicines() {
    return render(<MemoryRouter><MedicinesPage /></MemoryRouter>)
}

describe('medicine editor', () => {
    it('adds a validated medicine to local storage', async () => {
        const user = userEvent.setup()
        renderMedicines()
        await user.click(screen.getByRole('button', { name: /add medicine/i }))
        const dialog = screen.getByRole('dialog', { name: 'Add a medicine' })
        await user.type(within(dialog).getByLabelText('Medicine name'), 'Calcium')
        await user.type(within(dialog).getByLabelText('Dose'), '500 mg')
        await user.clear(within(dialog).getByLabelText('Time'))
        await user.type(within(dialog).getByLabelText('Time'), '11:00')
        await user.type(within(dialog).getByLabelText('Instructions'), 'Take with lunch')
        await user.type(within(dialog).getByLabelText('Notes (optional)'), 'Daily supplement')
        await user.click(within(dialog).getByRole('button', { name: 'Add medicine' }))
        expect(storage.getSnapshot().medicines).toContainEqual(expect.objectContaining({ name: 'Calcium', dose: '500 mg', schedule: '11:00' }))
    })

    it('shows accessible errors rather than saving invalid medicine fields', async () => {
        const user = userEvent.setup()
        renderMedicines()
        await user.click(screen.getByRole('button', { name: /add medicine/i }))
        const dialog = screen.getByRole('dialog', { name: 'Add a medicine' })
        await user.type(within(dialog).getByLabelText('Medicine name'), '<script>')
        await user.type(within(dialog).getByLabelText('Dose'), '!!!')
        await user.click(within(dialog).getByRole('button', { name: 'Add medicine' }))
        expect(await within(dialog).findByText(/common punctuation only/i)).toBeInTheDocument()
        expect(storage.getSnapshot().medicines).toHaveLength(4)
    })
})
