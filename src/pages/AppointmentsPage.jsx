import { useMemo, useState } from 'react'
import { CalendarDays, Clock3, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button, Card, Field, PageHeader } from '../components/UI.jsx'
import { storage, today } from '../lib/storage.js'
import { getRolePermissions } from '../lib/careMetrics.js'
import { validateAppointment } from '../lib/validation.js'
import { useData, useNotice } from '../lib/useData.js'

const formatTime = (time) => new Date(`2000-01-01T${time}:00`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

export default function AppointmentsPage() {
    const data = useData()
    const notify = useNotice()
    const [editor, setEditor] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [errors, setErrors] = useState({})
    const canEdit = getRolePermissions(data.profile.role).canManageAppointments
    const appointments = useMemo(() => [...data.appointments].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)), [data.appointments])
    function save(event) {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        const validation = validateAppointment({ ...Object.fromEntries(form.entries()), reminder: form.get('reminder') === 'on' })
        setErrors(validation.errors)
        if (!validation.valid) return
        storage.saveAppointment({ ...validation.value, id: editor?.id })
        notify(editor ? 'Appointment updated.' : 'Appointment added.')
        setShowForm(false); setEditor(null); setErrors({})
    }
    function remove(item) {
        if (!window.confirm(`Remove ${item.title}?`)) return
        storage.deleteAppointment(item.id)
        notify('Appointment removed.')
    }
    return <><PageHeader eyebrow="CARE CALENDAR" title="Appointments" description="Keep the next visit easy to find and easy to prepare for." action={canEdit && <Button onClick={() => { setEditor(null); setShowForm(true) }}><Plus size={18} /> Add appointment</Button>} /><div className="appointment-list">{appointments.map((item) => { const date = new Date(`${item.date}T12:00:00`); const past = item.date < today(); return <Card className={`appointment-item ${past ? 'appointment-item--past' : ''}`} key={item.id}><div className="appointment-date"><strong>{date.getDate()}</strong><span>{date.toLocaleDateString([], { month: 'short' }).toUpperCase()}</span></div><div className="appointment-item-main"><div className="appointment-item-title"><h2>{item.title}</h2><span className={`status-pill status-pill--${past ? 'neutral' : 'upcoming'}`}>{past ? 'Past' : item.reminder ? 'Reminder on' : 'Upcoming'}</span></div><div className="appointment-meta"><span><CalendarDays size={15} />{date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span><span><Clock3 size={15} />{formatTime(item.time)}</span><span><MapPin size={15} />{item.location || 'Location to be confirmed'}</span></div>{item.notes && <p className="appointment-notes">{item.notes}</p>}</div>{canEdit && <div className="appointment-actions"><button className="small-icon-button" aria-label={`Edit ${item.title}`} onClick={() => { setEditor(item); setShowForm(true) }}><Pencil size={17} /></button><button className="small-icon-button" aria-label={`Delete ${item.title}`} onClick={() => remove(item)}><Trash2 size={17} /></button></div>}</Card> })}{appointments.length === 0 && <Card className="empty-state"><CalendarDays size={26} /><strong>No appointments yet</strong><span>Your upcoming visits will show here.</span></Card>}</div>
        {showForm && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setShowForm(false); setErrors({}) } }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="appointment-form-title"><div className="section-heading"><div><p className="eyebrow">CARE CALENDAR</p><h2 id="appointment-form-title" className="section-title">{editor ? 'Edit appointment' : 'Add appointment'}</h2></div><button className="small-icon-button" aria-label="Close form" onClick={() => { setShowForm(false); setErrors({}) }}>×</button></div><form onSubmit={save} noValidate><div className="form-grid"><Field id="appointment-title" name="title" label="Appointment" required maxLength={100} defaultValue={editor?.title || ''} placeholder="e.g. Heart checkup" error={errors.title} /><Field id="appointment-provider" name="provider" label="Doctor or provider" maxLength={80} defaultValue={editor?.provider || ''} placeholder="e.g. Dr. Morgan" error={errors.provider} /><Field id="appointment-date" name="date" label="Date" type="date" min={today()} required defaultValue={editor?.date || ''} error={errors.date} /><Field id="appointment-time" name="time" label="Time" type="time" required defaultValue={editor?.time || '10:00'} error={errors.time} /><Field id="appointment-location" name="location" label="Location" maxLength={120} defaultValue={editor?.location || ''} placeholder="Clinic or address" error={errors.location} /><label className="field form-field-wide" htmlFor="appointment-notes"><span className="field-label">Notes</span><textarea id="appointment-notes" name="notes" maxLength={500} defaultValue={editor?.notes || ''} placeholder="What should the family remember?" aria-invalid={Boolean(errors.notes)} aria-describedby={errors.notes ? 'appointment-notes-error' : undefined} />{errors.notes && <span className="field-error" id="appointment-notes-error">{errors.notes}</span>}</label><label className="checkbox-row form-field-wide"><input type="checkbox" name="reminder" defaultChecked={editor ? editor.reminder : true} /><span>Send a reminder for this appointment</span></label></div><div className="form-actions"><Button variant="outline" onClick={() => { setShowForm(false); setErrors({}) }}>Cancel</Button><Button type="submit">{editor ? 'Save changes' : 'Add appointment'}</Button></div></form></section></div>}
    </>
}
