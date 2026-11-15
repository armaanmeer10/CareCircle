import { describe, expect, it } from 'vitest'
import { calculateAdherence, buildReminderPreview, getRolePermissions } from './careMetrics.js'

const sample = {
    profile: { name: 'Papa', email: 'papa@example.com' },
    medicines: [
        { id: 'm1', name: 'Aspirin', dose: '81 mg', schedule: '08:00', instructions: 'Take with breakfast' },
        { id: 'm2', name: 'Vitamin D', dose: '1,000 IU', schedule: '09:00' },
        { id: 'm3', name: 'Lisinopril', dose: '10 mg', schedule: '13:00' },
    ],
    doseLogs: [
        { id: 'l1', medicineId: 'm1', date: '2026-11-15', time: '08:00', status: 'taken' },
        { id: 'l2', medicineId: 'm2', date: '2026-11-15', time: '09:00', status: 'missed' },
    ],
    appointments: [{ title: 'Eye exam', date: '2026-11-16', time: '10:00', location: 'Oak Street', notes: 'Bring glasses' }],
    circleMembers: [{ name: 'Emma', role: 'Caretaker', email: 'emma@example.com' }],
    settings: { escalationMinutes: 30 },
}

describe('CareCircle adherence and permissions', () => {
    it('counts taken, missed, and upcoming doses against the medicine schedule', () => {
        expect(calculateAdherence(sample.medicines, sample.doseLogs, '2026-11-15')).toEqual({ taken: 1, missed: 1, upcoming: 1, scheduled: 3, percent: 33 })
    })

    it('keeps elders view-only and allows caretaker schedule management', () => {
        expect(getRolePermissions('Elder')).toMatchObject({ canViewMedicines: true, canRecordDose: true, canManageMedicines: false, canManageAppointments: false })
        expect(getRolePermissions('Caretaker')).toMatchObject({ canManageMedicines: true, canManageAppointments: true, canManageCareCircle: true })
        expect(getRolePermissions('Family')).toMatchObject({ canRecordDose: false, canManageMedicines: false, canManageAppointments: false })
    })

    it('builds a missed-dose reminder with elder-first escalation to caretaker after thirty minutes', () => {
        const preview = buildReminderPreview(sample, 'missed-dose', new Date('2026-11-15T07:00:00'))
        expect(preview.toName).toBe('Papa')
        expect(preview.body).toContain('Vitamin D')
        expect(preview.escalation).toEqual([
            expect.objectContaining({ afterMinutes: 0, recipient: 'Papa' }),
            expect.objectContaining({ afterMinutes: 30, recipient: 'Emma', action: expect.stringContaining('caretaker') }),
        ])
    })

    it('generates upcoming-dose and appointment reminder previews from stored data', () => {
        const dose = buildReminderPreview(sample, 'upcoming-dose', new Date('2026-11-15T07:00:00'))
        const appointment = buildReminderPreview(sample, 'appointment', new Date('2026-11-15T07:00:00'))
        expect(dose.body).toContain('Lisinopril')
        expect(dose.escalation[1].afterMinutes).toBe(30)
        expect(appointment.subject).toContain('Eye exam')
        expect(appointment.body).toContain('Oak Street')
    })

    it('schedules the next dose on the following day when today’s doses have passed', () => {
        const preview = buildReminderPreview(sample, 'upcoming-dose', new Date('2026-11-15T23:00:00'))
        expect(preview.body).toContain(new Date('2026-11-16T12:00:00').toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }))
    })
})
