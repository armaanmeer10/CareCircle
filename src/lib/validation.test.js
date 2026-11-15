import { describe, expect, it } from 'vitest'
import { isValidDate, sanitizeText, validateAppointment, validateDose, validateMedicine, validateMedicineName, validateMember, validateNotes, validateTime } from './validation.js'

describe('form validation and sanitization', () => {
    it('trims and bounds text, including control characters', () => {
        expect(sanitizeText('  Papa\n\u0000 Watson  ', 20)).toBe('Papa Watson')
        expect(sanitizeText('abcdef', 3)).toBe('abc')
    })

    it('accepts medicine names and doses and rejects markup', () => {
        expect(validateMedicineName(' Vitamin D3 ')).toMatchObject({ value: 'Vitamin D3', error: '' })
        expect(validateMedicineName('<script>')).toMatchObject({ error: expect.any(String) })
        expect(validateDose('1,000 IU').error).toBe('')
        expect(validateDose('<b>10 mg</b>').error).not.toBe('')
    })

    it('validates schedule time and notes', () => {
        expect(validateTime('23:59').error).toBe('')
        expect(validateTime('24:00').error).not.toBe('')
        expect(validateNotes('  Take with food  ').value).toBe('Take with food')
        expect(validateNotes('<img src=x>').error).not.toBe('')
    })

    it('validates complete medicine and appointment records', () => {
        expect(validateMedicine({ name: 'Aspirin', dose: '81 mg', schedule: '08:00', frequency: 'Daily' }).valid).toBe(true)
        expect(validateMedicine({ name: '', dose: '', schedule: '25:00' }).valid).toBe(false)
        expect(validateAppointment({ title: 'Eye exam', date: '2026-12-01', time: '10:30' }).valid).toBe(true)
        expect(validateAppointment({ title: '<script>', date: 'bad', time: '99:00' }).valid).toBe(false)
    })

    it('validates member email and fields', () => {
        expect(validateMember({ name: 'Emma Watson', email: ' EMMA@example.com ', role: 'Caretaker', access: 'Full access' })).toMatchObject({ valid: true, value: { email: 'emma@example.com' } })
        expect(validateMember({ name: '<img>', email: 'bad', role: 'Admin', access: 'root' }).valid).toBe(false)
    })

    it('rejects invalid calendar dates', () => {
        expect(isValidDate('2026-11-15')).toBe(true)
        expect(isValidDate('2026-02-31')).toBe(false)
    })
})
