const STORAGE_KEY = 'carecircle.v1'
import { constantTimeEqual, createPasscodeGuard, getDemoCredential, hashPasscode } from './security.js'
import { isValidDate, validateAppointment, validateMedicine, validateMember, validateNotes, validateTime } from './validation.js'

/** Format a Date using the device's local calendar rather than UTC. */
const localDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
/** Return the current local calendar date as an ISO date key. */
const today = () => localDate(new Date())
/** Return the local calendar date at a day offset from now. */
const dateOffset = (offset) => {
    const date = new Date()
    date.setDate(date.getDate() + offset)
    return localDate(date)
}
const id = () => globalThis.crypto?.randomUUID?.() ?? `cc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

/** Create a fresh demo dataset with a salted passcode digest and sample care records. */
export function createSeedData(now = new Date()) {
    const credential = getDemoCredential()
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
        profile: { name: 'Papa', role: null, email: 'papa@example.com', phone: '(555) 010-2024', ...credential },
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

function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function safeId(value) {
    const candidate = String(value ?? '')
    return /^[\w-]{1,80}$/.test(candidate) ? candidate : id()
}

export function normalizeStoredData(candidate) {
    if (!isRecord(candidate)
        || !isRecord(candidate.profile)
        || !isRecord(candidate.settings)
        || !Array.isArray(candidate.medicines)
        || !Array.isArray(candidate.appointments)
        || !Array.isArray(candidate.doseLogs)
        || !Array.isArray(candidate.circleMembers)) return null

    const seed = createSeedData()
    const medicines = candidate.medicines.slice(0, 200).flatMap((raw) => {
        if (!isRecord(raw)) return []
        const result = validateMedicine(raw)
        if (!result.valid) return []
        return [{ ...result.value, id: safeId(raw.id) }]
    })
    const medicineIds = new Set(medicines.map((item) => item.id))
    const appointments = candidate.appointments.slice(0, 200).flatMap((raw) => {
        if (!isRecord(raw)) return []
        const result = validateAppointment(raw)
        if (!result.valid) return []
        return [{ ...result.value, id: safeId(raw.id) }]
    })
    const circleMembers = candidate.circleMembers.slice(0, 100).flatMap((raw) => {
        if (!isRecord(raw)) return []
        const result = validateMember(raw)
        if (!result.valid) return []
        return [{ ...result.value, id: safeId(raw.id) }]
    })
    const doseLogs = candidate.doseLogs.slice(0, 5000).flatMap((raw) => {
        if (!isRecord(raw) || !medicineIds.has(raw.medicineId) || !isValidDate(raw.date)
            || validateTime(raw.time).error || !['taken', 'missed'].includes(raw.status)) return []
        const loggedAt = typeof raw.loggedAt === 'string' && !Number.isNaN(Date.parse(raw.loggedAt))
            ? new Date(raw.loggedAt).toISOString()
            : new Date(`${raw.date}T${raw.time}:00`).toISOString()
        return [{ id: safeId(raw.id), medicineId: raw.medicineId, date: raw.date, time: raw.time, status: raw.status, loggedAt }]
    })
    const role = ['Elder', 'Caretaker', 'Family'].includes(candidate.profile.role) ? candidate.profile.role : null
    const storedName = validateNotes(candidate.profile.name, 70)
    const profileName = storedName.error ? seed.profile.name : storedName.value
    const storedEmail = validateMember({ name: 'Profile', email: candidate.profile.email, role: 'Family', access: 'View updates' })
    const storedPhone = String(candidate.profile.phone ?? '').replace(/[^\d+() -]/g, '').slice(0, 30)
    const settings = {
        textSize: ['standard', 'large', 'larger'].includes(candidate.settings.textSize) ? candidate.settings.textSize : seed.settings.textSize,
        highContrast: candidate.settings.highContrast === true,
        reminders: candidate.settings.reminders !== false,
        emailReminders: candidate.settings.emailReminders !== false,
        escalationMinutes: [15, 30, 60, 120].includes(Number(candidate.settings.escalationMinutes)) ? Number(candidate.settings.escalationMinutes) : 30,
    }
    return {
        profile: { ...seed.profile, name: profileName, role, email: storedEmail.valid ? storedEmail.value.email : seed.profile.email, phone: storedPhone || seed.profile.phone, ...getDemoCredential() },
        medicines,
        appointments,
        doseLogs,
        circleMembers,
        settings,
    }
}

function readStorage() {
    try {
        const saved = globalThis.localStorage?.getItem(STORAGE_KEY)
        if (saved) {
            return normalizeStoredData(JSON.parse(saved)) || createSeedData()
        }
    } catch {
        // Use in-memory seed data when storage is disabled or malformed.
    }
    return createSeedData()
}

let state = readStorage()
let accessGranted = false
const listeners = new Set()

function getSessionStorage() {
    try {
        return globalThis.sessionStorage || null
    } catch {
        return null
    }
}

const passcodeGuard = createPasscodeGuard({ verify: verifyPasscodeHash, storage: getSessionStorage() })

async function verifyPasscodeHash(passcode) {
    try {
        const digest = await hashPasscode(passcode, state.profile.passcodeSalt)
        return constantTimeEqual(digest, state.profile.passcodeHash)
    } catch {
        return false
    }
}

function notify() {
    try {
        globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
        // The app remains usable for this tab when storage is unavailable.
    }
    listeners.forEach((listener) => listener())
}

export const storage = {
    /** Read the current validated in-memory data snapshot. */
    getSnapshot: () => state,
    /** Subscribe to changes and return an unsubscribe function. */
    subscribe(listener) {
        listeners.add(listener)
        return () => listeners.delete(listener)
    },
    /** Apply an update, normalize it against the storage schema, and notify listeners. */
    update(updater) {
        try {
            const candidate = typeof updater === 'function' ? updater(state) : updater
            state = normalizeStoredData(candidate) || state
        } catch {
            return state
        }
        notify()
        return state
    },
    /** Restore sample data, clear transient session access, and reset passcode attempts. */
    reset() {
        state = createSeedData()
        accessGranted = false
        passcodeGuard.reset()
        notify()
        return state
    },
    /** Reload and validate persisted browser data, falling back safely if corrupted. */
    reload() {
        state = readStorage()
        notify()
        return state
    },
    hasAccess() {
        return accessGranted
    },
    grantAccess() {
        accessGranted = true
    },
    /** Hash and compare a candidate passcode, applying the lockout policy. */
    verifyPasscode(passcode) {
        return passcodeGuard.check(passcode)
    },
    getPasscodeLockout() {
        return passcodeGuard.getLockedUntil()
    },
    resetPasscodeAttempts() {
        passcodeGuard.reset()
    },
    setRole(role) {
        if (role !== null && !['Elder', 'Caretaker', 'Family'].includes(role)) return state
        if (!role) accessGranted = false
        return this.update((current) => ({ ...current, profile: { ...current.profile, role } }))
    },
    markDose(medicineId, status = 'taken', date = today()) {
        if (!['Elder', 'Caretaker'].includes(state.profile.role) || !['taken', 'missed'].includes(status) || !isValidDate(date)) return state
        const medicine = state.medicines.find((item) => item.id === medicineId)
        if (!medicine) return state
        const entry = { id: id(), medicineId, date, time: medicine.schedule, status, loggedAt: new Date().toISOString() }
        return this.update((current) => ({ ...current, doseLogs: [...current.doseLogs.filter((log) => !(log.medicineId === medicineId && log.date === date)), entry] }))
    },
    saveMedicine(medicine) {
        if (state.profile.role !== 'Caretaker' || !isRecord(medicine)) return state
        const validation = validateMedicine(medicine)
        if (!validation.valid) return state
        const saved = { ...validation.value, id: safeId(medicine.id) }
        return this.update((current) => ({ ...current, medicines: current.medicines.some((item) => item.id === saved.id) ? current.medicines.map((item) => item.id === saved.id ? saved : item) : [...current.medicines, saved] }))
    },
    deleteMedicine(medicineId) {
        if (state.profile.role !== 'Caretaker') return state
        return this.update((current) => ({ ...current, medicines: current.medicines.filter((item) => item.id !== medicineId), doseLogs: current.doseLogs.filter((log) => log.medicineId !== medicineId) }))
    },
    saveAppointment(appointment) {
        if (state.profile.role !== 'Caretaker' || !isRecord(appointment)) return state
        const validation = validateAppointment(appointment)
        if (!validation.valid) return state
        const saved = { ...validation.value, id: safeId(appointment.id) }
        return this.update((current) => ({ ...current, appointments: current.appointments.some((item) => item.id === saved.id) ? current.appointments.map((item) => item.id === saved.id ? saved : item) : [...current.appointments, saved] }))
    },
    deleteAppointment(appointmentId) {
        if (state.profile.role !== 'Caretaker') return state
        return this.update((current) => ({ ...current, appointments: current.appointments.filter((item) => item.id !== appointmentId) }))
    },
}

export { dateOffset, today }
