import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from '../App.jsx'
import { storage } from '../lib/storage.js'

beforeEach(() => {
    localStorage.clear()
    storage.reset()
})

function renderApp() {
    return render(<MemoryRouter initialEntries={['/access']}><App /></MemoryRouter>)
}

describe('passcode and role access', () => {
    it('redirects direct role-route visits to passcode access', async () => {
        render(<MemoryRouter initialEntries={['/role']}><App /></MemoryRouter>)
        expect(await screen.findByLabelText('Your 6-digit passcode')).toBeInTheDocument()
    })

    it('shows validation for an incorrect passcode', async () => {
        const user = userEvent.setup()
        renderApp()
        await user.type(screen.getByLabelText('Your 6-digit passcode'), '111111')
        await user.click(screen.getByRole('button', { name: /continue/i }))
        expect(await screen.findByText('That passcode didn’t match. Please try again.')).toBeInTheDocument()
    })

    it('opens role selection with the demo passcode and saves the chosen role', async () => {
        const user = userEvent.setup()
        renderApp()
        await user.type(screen.getByLabelText('Your 6-digit passcode'), '123456')
        await user.click(screen.getByRole('button', { name: /continue/i }))
        await user.click(await screen.findByRole('button', { name: /i’m receiving care/i }))
        expect(storage.getSnapshot().profile.role).toBe('Elder')
        expect(screen.getByRole('heading', { name: /good morning, papa/i })).toBeInTheDocument()
    })

    it('rejects malformed passcodes before checking the saved value', async () => {
        renderApp()
        fireEvent.change(screen.getByLabelText('Your 6-digit passcode'), { target: { value: '12' } })
        fireEvent.submit(screen.getByLabelText('Your 6-digit passcode').closest('form'))
        expect(await screen.findByText('Enter your 6-digit passcode.')).toBeInTheDocument()
    })
})
