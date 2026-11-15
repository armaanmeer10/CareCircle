const STORAGE_KEY = 'carecircle.v1'
const DEMO_PASSCODE = '123456'

const localDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const today = () => localDate(new Date())
const dateOffset = (offset) => {
    const date = new Date()
    date.setDate(date.getDate() + offset)
    return localDate(date)
}
const id = () => globalThis.crypto?.randomUUID?.() ?? `cc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export function createSeedData(now = new Date()) {
    const day = (offset) => {
        const date = new Date(now)
        date.setDate(date.getDate() + offset)
        return localDate(date)
    }
    const medicines = [
        { id: 'med-aspirin', name: 'Aspirin', dose: '81 mg', instructions: 'Take with breakfast', schedule: '08:00', frequency: 'Daily', notes: 'For heart health' },
        { id: 'med-vitamin-d', name: 'Vitamin D3', dose: '1,000 IU', instructions: 'Take with food', schedule: '09:00', frequency: 'Daily', notes: 'Morning supplement' },
        { id: 'med-lisinopril', name: 'Lisinopril', dose: '10 mg', instructions: 'Take with a glass of water', schedule: '13:00', frequency: 'Daily', notes: 'Blood pressure' },
        { id: 'med-atorvastatin', name: 'Atorvastatin', dose: '20 mg', instructions: 'Take in the evening', schedule: '20:00', frequency: 'Daily', notes: 'Cholesterol' },
    ]
    const doseLogs = []
    for (let offset = -6; offset <= 0; offset += 1) {
        medicines.forEach((medicine, index) => {
            const status = offset === 0 && index === 2 ? 'missed' : ((Math.abs(offset + index) % 9 === 0) ? 'missed' : 'taken')
            doseLogs.push({ id: `seed-${offset}-${medicine.id}`, medicineId: medicine.id, date: day(offset), time: medicine.schedule, status, loggedAt: new Date(`${day(offset)}T${medicine.schedule}:00`).toISOString() })
        })
    }
    return {
        profile: { name: 'Papa', role: null, passcode: DEMO_PASSCODE, email: 'family@example.com', phone: '(555) 010-2024' },
        medicines,
        appointments: [
            { id: 'appt-checkup', title: 'Dr. Morgan — Heart checkup', provider: 'Dr. Morgan', location: 'Riverside Medical Center', date: day(1), time: '10:30', notes: 'Bring the current medication list', reminder: true },
            { id: 'appt-eye', title: 'Annual eye exam', provider: 'Dr. Chen', location: 'Oak Street Vision', date: day(5), time: '14:00', notes: 'Bring reading glasses', reminder: true },
        ],
        doseLogs,
        circleMembers: [
            { id: 'member-emma', name: 'Emma Watson', role: 'Caretaker', email: 'emma@example.com', access: 'Full access' },
            { id: 'member-marcus', name: 'Marcus Watson', role: 'Family', email: 'marcus@example.com', access: 'View updates' },
        ],
        settings: { textSize: 'standard', highContrast: false, reminders: true, emailReminders: true, escalationMinutes: 30 },
    }
}

function readStorage() {
    try {
        const saved = globalThis.localStorage?.getItem(STORAGE_KEY)
        if (saved) {
            const seed = createSeedData()
            const parsed = JSON.parse(saved)
            return {
                ...seed,
                ...parsed,
                profile: { ...seed.profile, ...parsed.profile },
                settings: { ...seed.settings, ...parsed.settings },
            }
        }
    } catch {
        // Use in-memory seed data when storage is disabled or malformed.
    }
    return createSeedData()
}

let state = readStorage()
let accessGranted = false
const listeners = new Set()

function notify() {
    try {
        globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
        // The app remains usable for this tab when storage is unavailable.
    }
    listeners.forEach((listener) => listener())
}

export const storage = {
    getSnapshot: () => state,
    subscribe(listener) {
        listeners.add(listener)
        return () => listeners.delete(listener)
    },
    update(updater) {
        state = typeof updater === 'function' ? updater(state) : updater
        notify()
        return state
    },
    reset() {
        state = createSeedData()
        accessGranted = false
        notify()
        return state
    },
    hasAccess() {
        return accessGranted
    },
    grantAccess() {
        accessGranted = true
    },
    verifyPasscode(passcode) {
        return String(passcode) === String(state.profile.passcode)
    },
    setRole(role) {
        if (!role) accessGranted = false
        return this.update((current) => ({ ...current, profile: { ...current.profile, role } }))
    },
    markDose(medicineId, status = 'taken', date = today()) {
        const medicine = state.medicines.find((item) => item.id === medicineId)
        if (!medicine) return state
        const entry = { id: id(), medicineId, date, time: medicine.schedule, status, loggedAt: new Date().toISOString() }
        return this.update((current) => ({ ...current, doseLogs: [...current.doseLogs.filter((log) => !(log.medicineId === medicineId && log.date === date)), entry] }))
    },
    saveMedicine(medicine) {
        const saved = { ...medicine, id: medicine.id || id() }
        return this.update((current) => ({ ...current, medicines: current.medicines.some((item) => item.id === saved.id) ? current.medicines.map((item) => item.id === saved.id ? saved : item) : [...current.medicines, saved] }))
    },
    deleteMedicine(medicineId) {
        return this.update((current) => ({ ...current, medicines: current.medicines.filter((item) => item.id !== medicineId) }))
    },
    saveAppointment(appointment) {
        const saved = { ...appointment, id: appointment.id || id() }
        return this.update((current) => ({ ...current, appointments: current.appointments.some((item) => item.id === saved.id) ? current.appointments.map((item) => item.id === saved.id ? saved : item) : [...current.appointments, saved] }))
    },
    deleteAppointment(appointmentId) {
        return this.update((current) => ({ ...current, appointments: current.appointments.filter((item) => item.id !== appointmentId) }))
    },
}

export { dateOffset, today }
