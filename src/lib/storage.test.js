import { beforeEach, describe, expect, it } from 'vitest'
import { createSeedData, storage, today } from './storage.js'

beforeEach(() => {
    localStorage.clear()
    storage.reset()
})

describe('CareCircle local data layer', () => {
    it('seeds Papa, four medicines, two appointments, and a week of dose history', () => {
        const data = createSeedData(new Date('2026-11-15T12:00:00'))
        expect(data.profile.name).toBe('Papa')
        expect(data.medicines).toHaveLength(4)
        expect(data.appointments).toHaveLength(2)
        expect(data.doseLogs.length).toBeGreaterThanOrEqual(28)
    })

    it('verifies the six-digit demo passcode', () => {
        expect(storage.verifyPasscode('123456')).toBe(true)
        expect(storage.verifyPasscode('000000')).toBe(false)
    })

    it('updates today’s dose instead of adding duplicate dose records', () => {
        storage.markDose('med-aspirin', 'taken')
        storage.markDose('med-aspirin', 'missed')
        const todayLogs = storage.getSnapshot().doseLogs.filter((log) => log.medicineId === 'med-aspirin' && log.date === today())
        expect(todayLogs).toHaveLength(1)
        expect(todayLogs[0].status).toBe('missed')
        expect(JSON.parse(localStorage.getItem('carecircle.v1')).doseLogs).toHaveLength(storage.getSnapshot().doseLogs.length)
    })

    it('adds, updates, and deletes medicines by id', () => {
        storage.saveMedicine({ name: 'Calcium', dose: '500 mg', schedule: '11:00' })
        const added = storage.getSnapshot().medicines.find((item) => item.name === 'Calcium')
        storage.saveMedicine({ ...added, dose: '600 mg' })
        expect(storage.getSnapshot().medicines.filter((item) => item.name === 'Calcium')).toHaveLength(1)
        expect(storage.getSnapshot().medicines.find((item) => item.id === added.id).dose).toBe('600 mg')
        storage.deleteMedicine(added.id)
        expect(storage.getSnapshot().medicines.some((item) => item.id === added.id)).toBe(false)
    })

    it('saves appointments and role changes to local storage', () => {
        storage.saveAppointment({ title: 'Dentist', date: '2026-12-01', time: '10:00' })
        storage.setRole('Family')
        const saved = JSON.parse(localStorage.getItem('carecircle.v1'))
        expect(saved.appointments.some((item) => item.title === 'Dentist')).toBe(true)
        expect(saved.profile.role).toBe('Family')
    })
})
