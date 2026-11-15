const SAFE_TEXT = /^[\p{L}\p{N}\s.,:;!?()'’"/+&%#@_-]*$/u
const MEDICINE_NAME = /^[\p{L}\p{N}][\p{L}\p{N}\s.'’()+/-]*$/u
const DOSE = /^[\p{L}\p{N}\s.,/()+-]*$/u
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const TIME_24H = /^(?:[01]\d|2[0-3]):[0-5]\d$/
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/
// eslint-disable-next-line no-control-regex
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/g

/** Trim, remove unsafe control characters, and bound a text value. */
export function sanitizeText(value, maxLength = 500) {
    return String(value ?? '')
        .replace(CONTROL_CHARACTERS, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxLength)
}

/** Trim and validate a medicine name. */
export function validateMedicineName(value) {
    const sanitized = sanitizeText(value, 70)
    if (!sanitized) return { value: sanitized, error: 'Enter a medicine name.' }
    if (!MEDICINE_NAME.test(sanitized)) return { value: sanitized, error: 'Use letters, numbers, spaces, and common punctuation only.' }
    return { value: sanitized, error: '' }
}

/** Trim and validate a dose label such as 10 mg or 1,000 IU. */
export function validateDose(value) {
    const sanitized = sanitizeText(value, 40)
    if (!sanitized) return { value: sanitized, error: 'Enter a dose.' }
    if (!DOSE.test(sanitized)) return { value: sanitized, error: 'Use letters, numbers, and common dose punctuation only.' }
    return { value: sanitized, error: '' }
}

/** Validate a 24-hour HH:mm schedule time. */
export function validateTime(value) {
    const sanitized = sanitizeText(value, 5)
    return TIME_24H.test(sanitized) ? { value: sanitized, error: '' } : { value: sanitized, error: 'Choose a valid time.' }
}

/** Trim notes and reject markup-like or control content. */
export function validateNotes(value, maxLength = 500) {
    const sanitized = sanitizeText(value, maxLength)
    if (!SAFE_TEXT.test(sanitized)) return { value: sanitized.replace(/[<>]/g, ''), error: 'Use plain text without markup characters.' }
    return { value: sanitized, error: '' }
}

/** Validate and sanitize every medicine editor field. */
export function validateMedicine(values = {}) {
    const name = validateMedicineName(values.name)
    const dose = validateDose(values.dose)
    const time = validateTime(values.schedule)
    const instructions = validateNotes(values.instructions, 120)
    const notes = validateNotes(values.notes, 500)
    const frequency = validateNotes(values.frequency ?? 'Daily', 40)
    const errors = { name: name.error, dose: dose.error, schedule: time.error, instructions: instructions.error, notes: notes.error }
    if (!frequency.value) errors.frequency = 'Enter how often to take this medicine.'
    const value = {
        name: name.value,
        dose: dose.value,
        schedule: time.value,
        instructions: instructions.value,
        notes: notes.value,
        frequency: frequency.value,
    }
    return { value, errors, valid: Object.values(errors).every((error) => !error) }
}

/** Validate and sanitize appointment fields before they reach storage. */
export function validateAppointment(values = {}) {
    const title = validateNotes(values.title, 100)
    const provider = validateNotes(values.provider, 80)
    const location = validateNotes(values.location, 120)
    const notes = validateNotes(values.notes, 500)
    const time = validateTime(values.time)
    const date = sanitizeText(values.date, 10)
    const errors = {
        title: title.value ? title.error : 'Enter an appointment name.',
        provider: provider.error,
        location: location.error,
        notes: notes.error,
        time: time.error,
        date: isValidDate(date) ? '' : 'Choose a valid appointment date.',
    }
    if (!SAFE_TEXT.test(title.value)) errors.title = 'Use plain text without markup characters.'
    return {
        value: { title: title.value, provider: provider.value, location: location.value, notes: notes.value, time: time.value, date, reminder: Boolean(values.reminder) },
        errors,
        valid: Object.values(errors).every((error) => !error),
    }
}

/** Validate a care-circle member's display name, email, role, and access. */
export function validateMember(values = {}) {
    const name = validateNotes(values.name, 70)
    const email = sanitizeText(values.email, 120).toLowerCase()
    const role = ['Caretaker', 'Family'].includes(values.role) ? values.role : ''
    const access = ['Full access', 'View updates'].includes(values.access) ? values.access : ''
    const errors = {
        name: name.value ? name.error : 'Enter a name.',
        email: EMAIL.test(email) ? '' : 'Enter a valid email address.',
        role: role ? '' : 'Choose a valid care-circle role.',
        access: access ? '' : 'Choose a valid access level.',
    }
    return { value: { name: name.value, email, role, access }, errors, valid: Object.values(errors).every((error) => !error) }
}

/** Validate an appointment date string without allowing impossible calendar days. */
export function isValidDate(value) {
    if (!ISO_DATE.test(String(value ?? ''))) return false
    const date = new Date(`${value}T12:00:00`)
    return !Number.isNaN(date.valueOf())
        && date.getFullYear() === Number(value.slice(0, 4))
        && date.getMonth() + 1 === Number(value.slice(5, 7))
        && date.getDate() === Number(value.slice(8, 10))
}
