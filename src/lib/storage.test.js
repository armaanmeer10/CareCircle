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

    it('verifies the six-digit demo passcode', async () => {
        expect(storage.getSnapshot().profile).not.toHaveProperty('passcode')
        expect(storage.getSnapshot().profile.passcodeHash).toMatch(/^[a-f0-9]{64}$/)
        expect(await storage.verifyPasscode('123456')).toMatchObject({ ok: true })
        expect(await storage.verifyPasscode('000000')).toMatchObject({ ok: false, attemptsRemaining: 4 })
    })

    it('updates today’s dose instead of adding duplicate dose records', () => {
        storage.setRole('Elder')
        storage.markDose('med-aspirin', 'taken')
        storage.markDose('med-aspirin', 'missed')
        const todayLogs = storage.getSnapshot().doseLogs.filter((log) => log.medicineId === 'med-aspirin' && log.date === today())
        expect(todayLogs).toHaveLength(1)
        expect(todayLogs[0].status).toBe('missed')
        expect(JSON.parse(localStorage.getItem('carecircle.v1')).doseLogs).toHaveLength(storage.getSnapshot().doseLogs.length)
    })

    it('adds, updates, and deletes medicines by id', () => {
        storage.setRole('Caretaker')
        storage.saveMedicine({ name: 'Calcium', dose: '500 mg', schedule: '11:00' })
        const added = storage.getSnapshot().medicines.find((item) => item.name === 'Calcium')
        storage.saveMedicine({ ...added, dose: '600 mg' })
        expect(storage.getSnapshot().medicines.filter((item) => item.name === 'Calcium')).toHaveLength(1)
        expect(storage.getSnapshot().medicines.find((item) => item.id === added.id).dose).toBe('600 mg')
        storage.deleteMedicine(added.id)
        expect(storage.getSnapshot().medicines.some((item) => item.id === added.id)).toBe(false)
    })

    it('saves appointments and role changes to local storage', () => {
        storage.setRole('Caretaker')
        storage.saveAppointment({ title: 'Dentist', date: '2026-12-01', time: '10:00' })
        storage.setRole('Family')
        const saved = JSON.parse(localStorage.getItem('carecircle.v1'))
        expect(saved.appointments.some((item) => item.title === 'Dentist')).toBe(true)
        expect(saved.profile.role).toBe('Family')
    })

    it('recovers from malformed JSON and rejects malformed stored records', () => {
        localStorage.setItem('carecircle.v1', '{not json')
        expect(storage.reload().profile.name).toBe('Papa')
        localStorage.setItem('carecircle.v1', JSON.stringify({ profile: {}, settings: {}, medicines: '<script>', appointments: [], doseLogs: [], circleMembers: [] }))
        expect(storage.reload().medicines).toHaveLength(4)
    })

    it('prevents elders from editing medicines and normalizes saved fields', () => {
        storage.setRole('Elder')
        const count = storage.getSnapshot().medicines.length
        storage.saveMedicine({ name: '  Unsafe <script>  ', dose: '12 mg', schedule: '09:00' })
        expect(storage.getSnapshot().medicines).toHaveLength(count)
        storage.setRole('Caretaker')
        storage.saveMedicine({ name: '  Calcium  ', dose: ' 500 mg ', schedule: '09:00', frequency: 'Daily' })
        expect(storage.getSnapshot().medicines.at(-1)).toMatchObject({ name: 'Calcium', dose: '500 mg' })
    })

    it('keeps family access read-only for doses and appointments', () => {
        storage.setRole('Family')
        const doseCount = storage.getSnapshot().doseLogs.length
        const appointmentCount = storage.getSnapshot().appointments.length
        storage.markDose('med-aspirin', 'taken')
        storage.saveAppointment({ title: 'Eye exam', date: '2026-12-01', time: '10:00' })
        storage.deleteAppointment('appt-checkup')
        expect(storage.getSnapshot().doseLogs).toHaveLength(doseCount)
        expect(storage.getSnapshot().appointments).toHaveLength(appointmentCount)
    })
})
