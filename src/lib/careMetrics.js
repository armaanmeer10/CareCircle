import { dateOffset, today } from './storage.js'

/** Return role-based UI edit permissions without granting elders schedule edits. */
export function getRolePermissions(role) {
    return {
        canViewMedicines: ['Elder', 'Caretaker', 'Family'].includes(role),
        canManageMedicines: role === 'Caretaker',
        canRecordDose: ['Elder', 'Caretaker'].includes(role),
        canManageAppointments: role === 'Caretaker',
        canManageCareCircle: role === 'Caretaker',
        canViewInsights: ['Caretaker', 'Family'].includes(role),
        canViewDashboard: role === 'Caretaker',
    }
}

/** Resolve a medicine's dose status for a day; an unlogged dose remains upcoming. */
export function getDoseStatus(medicineId, doseLogs, date = today()) {
    return doseLogs.find((log) => log.medicineId === medicineId && log.date === date)?.status || 'upcoming'
}

/** Summarize adherence against scheduled medicines, counting unlogged doses as upcoming. */
export function calculateAdherence(medicines, doseLogs, date = today()) {
    const statuses = medicines.map((medicine) => getDoseStatus(medicine.id, doseLogs, date))
    const taken = statuses.filter((status) => status === 'taken').length
    const missed = statuses.filter((status) => status === 'missed').length
    const upcoming = statuses.filter((status) => status === 'upcoming').length
    const scheduled = statuses.length
    return { taken, missed, upcoming, scheduled, percent: scheduled ? Math.round((taken / scheduled) * 100) : 100 }
}

/** Build a local email reminder preview from stored medicines, dose logs, and appointments. */
export function buildReminderPreview(data, kind = 'missed-dose', now = new Date()) {
    const careRecipient = data.profile.name
    const caretaker = data.circleMembers.find((member) => member.role === 'Caretaker')
    const caretakerName = caretaker?.name || 'your caretaker'
    const caretakerEmail = caretaker?.email || data.profile.email
    const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const missed = [...data.doseLogs]
        .filter((log) => log.status === 'missed' && log.date <= todayDate)
        .sort((left, right) => `${right.date}${right.time}`.localeCompare(`${left.date}${left.time}`))[0]
    const missedMedicine = data.medicines.find((medicine) => medicine.id === missed?.medicineId)
    const futureAppointment = [...data.appointments]
        .filter((appointment) => `${appointment.date}${appointment.time}` >= `${todayDate}${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`)
        .sort((left, right) => `${left.date}${left.time}`.localeCompare(`${right.date}${right.time}`))[0]

    if (kind === 'appointment') {
        const appointment = futureAppointment
        const date = appointment ? new Date(`${appointment.date}T12:00:00`).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }) : 'the scheduled day'
        const subject = appointment ? `A reminder: ${appointment.title}` : 'Your CareCircle appointment reminder'
        const body = appointment
            ? `Hello ${careRecipient},\n\nThis is a friendly reminder about ${appointment.title} on ${date} at ${formatTime(appointment.time)}${appointment.location ? ` at ${appointment.location}` : ''}.\n\n${appointment.notes || 'Your care circle is here if you need help getting ready.'}\n\nWith care,\nYour CareCircle`
            : `Hello ${careRecipient},\n\nThere are no upcoming appointments saved in your care calendar.\n\nWith care,\nYour CareCircle`
        return { kind, subject, body, toName: careRecipient, toEmail: data.profile.email, source: appointment?.title || 'Care calendar', escalation: [] }
    }

    if (kind === 'upcoming-dose') {
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        const doseCandidates = [...data.medicines]
            .filter((medicine) => !(data.doseLogs.some((log) => log.medicineId === medicine.id && log.date === todayDate)))
            .sort((left, right) => left.schedule.localeCompare(right.schedule))
        const nextToday = doseCandidates.find((medicine) => medicine.schedule >= currentTime)
        const upcomingMedicine = nextToday || [...data.medicines].sort((left, right) => left.schedule.localeCompare(right.schedule))[0]
        const nextDay = new Date(`${todayDate}T12:00:00`)
        nextDay.setDate(nextDay.getDate() + 1)
        const dueDate = nextToday ? todayDate : `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`
        const dueDateLabel = new Date(`${dueDate}T12:00:00`).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
        const subject = upcomingMedicine ? `A gentle reminder: ${upcomingMedicine.name} is coming up` : 'A gentle reminder from CareCircle'
        const body = upcomingMedicine
            ? `Hello ${careRecipient},\n\nA gentle reminder that ${upcomingMedicine.name} (${upcomingMedicine.dose}) is scheduled for ${dueDateLabel} at ${formatTime(upcomingMedicine.schedule)}${upcomingMedicine.instructions ? ` — ${upcomingMedicine.instructions.toLowerCase()}` : ''}.\n\nYour care circle is here if you need a hand.\n\nWith care,\nYour CareCircle`
            : `Hello ${careRecipient},\n\nThere are no medicines in the current care plan.\n\nWith care,\nYour CareCircle`
        const escalationMinutes = data.settings.escalationMinutes || 30
        return {
            kind,
            subject,
            body,
            toName: careRecipient,
            toEmail: data.profile.email,
            source: upcomingMedicine ? `${upcomingMedicine.name} · ${dueDateLabel}` : 'Medicine schedule',
            escalation: upcomingMedicine ? [
                { afterMinutes: 0, recipient: careRecipient, email: data.profile.email, action: 'Send the first gentle reminder to the elder.' },
                { afterMinutes: escalationMinutes, recipient: caretakerName, email: caretakerEmail, action: 'If still unconfirmed, notify the caretaker.' },
            ] : [],
        }
    }

    const subject = missedMedicine ? `A gentle check-in: ${missedMedicine.name} reminder` : 'A gentle check-in from CareCircle'
    const date = missed ? new Date(`${missed.date}T12:00:00`).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }) : 'today'
    const body = missedMedicine
        ? `Hello ${careRecipient},\n\nA gentle reminder that your ${missedMedicine.name} (${missedMedicine.dose}) was marked missed on ${date} at ${formatTime(missed.time)}. If you have already taken it, you can update your check-in in CareCircle.\n\nYour care circle is here to support you.\n\nWith care,\nYour CareCircle`
        : `Hello ${careRecipient},\n\nThere are no missed medicine check-ins in the current care record. Your care circle is here if you need a hand.\n\nWith care,\nYour CareCircle`
    const escalationMinutes = data.settings.escalationMinutes || 30
    return {
        kind: 'missed-dose',
        subject,
        body,
        toName: careRecipient,
        toEmail: data.profile.email,
        source: missedMedicine ? `${missedMedicine.name} · ${date}` : 'Current care record',
        escalation: missedMedicine ? [
            { afterMinutes: 0, recipient: careRecipient, email: data.profile.email, action: 'Send the first gentle reminder to the elder.' },
            { afterMinutes: escalationMinutes, recipient: caretakerName, email: caretakerEmail, action: 'If still unconfirmed, notify the caretaker.' },
        ] : [],
    }
}

function formatTime(time) {
    return new Date(`2000-01-01T${time}:00`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

/** Produce the next seven dates for a weekly adherence chart. */
export function getWeeklyDates() {
    return Array.from({ length: 7 }, (_, index) => dateOffset(index - 6))
}
