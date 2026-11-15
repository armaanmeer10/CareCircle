import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Clock3, Heart, Plus, Search, Trash2 } from 'lucide-react'
import { Button, Card, Field, PageHeader, StatusPill } from '../components/UI.jsx'
import { storage, today } from '../lib/storage.js'
import { getRolePermissions } from '../lib/careMetrics.js'
import { validateMedicine } from '../lib/validation.js'
import { useData, useNotice } from '../lib/useData.js'

const formatTime = (time) => new Date(`2000-01-01T${time}:00`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

export function MedicinesPage() {
    const data = useData()
    const notify = useNotice()
    const [query, setQuery] = useState('')
    const [editing, setEditing] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [errors, setErrors] = useState({})
    const caretaker = getRolePermissions(data.profile.role).canManageMedicines
    const filtered = useMemo(() => data.medicines.filter((medicine) => `${medicine.name} ${medicine.dose}`.toLowerCase().includes(query.toLowerCase())), [data.medicines, query])

    function save(event) {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        const validation = validateMedicine(Object.fromEntries(form.entries()))
        setErrors(validation.errors)
        if (!validation.valid) return
        storage.saveMedicine({ ...validation.value, id: editing?.id })
        notify(editing ? 'Medicine updated.' : 'Medicine added to the care plan.')
        setEditing(null); setShowForm(false); setErrors({})
    }

    function remove(medicine) {
        if (!window.confirm(`Remove ${medicine.name} from the care plan?`)) return
        storage.deleteMedicine(medicine.id)
        notify(`${medicine.name} removed.`)
    }

    return <>
        <PageHeader eyebrow="MEDICINE PLAN" title="Medicines" description={`${data.medicines.length} medicines in ${data.profile.name}’s care plan.`} action={caretaker && <Button onClick={() => { setEditing(null); setShowForm(true) }}><Plus size={18} /> Add medicine</Button>} />
        <Card><div className="section-heading"><div><h2 className="section-title">Your medicine list</h2><p className="section-subtitle">Everything in one easy-to-find place.</p></div><label className="search-box"><Search size={17} /><span className="sr-only">Search medicines</span><input aria-label="Search medicines" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search medicines" /></label></div>
            <div className="medicine-list">{filtered.map((medicine) => { const status = data.doseLogs.find((log) => log.medicineId === medicine.id && log.date === today())?.status || 'upcoming'; return <article className="medicine-list-item" key={medicine.id}><div className="medicine-symbol"><Heart size={22} /></div><div className="medicine-list-copy"><Link to={`/medicines/${medicine.id}`}><strong>{medicine.name}</strong></Link><span>{medicine.dose} · {medicine.instructions}</span></div><span className="medicine-schedule"><Clock3 size={15} />{formatTime(medicine.schedule)}</span><StatusPill status={status}>{status === 'taken' ? 'Taken today' : status === 'missed' ? 'Missed' : 'Upcoming'}</StatusPill><Link className="small-icon-button" aria-label={`View ${medicine.name} details`} to={`/medicines/${medicine.id}`}><ArrowRight size={17} /></Link>{caretaker && <div className="table-actions"><button className="small-icon-button" aria-label={`Edit ${medicine.name}`} onClick={() => { setEditing(medicine); setShowForm(true) }}>✎</button><button className="small-icon-button" aria-label={`Delete ${medicine.name}`} onClick={() => remove(medicine)}><Trash2 size={16} /></button></div>}</article> })}{filtered.length === 0 && <div className="empty-state"><Search size={23} /><strong>No medicines found</strong><span>Try a different search.</span></div>}</div>
        </Card>
        {showForm && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false) }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="medicine-form-title"><div className="section-heading"><div><p className="eyebrow">CARE PLAN</p><h2 id="medicine-form-title" className="section-title">{editing ? 'Edit medicine' : 'Add a medicine'}</h2></div><button className="small-icon-button" aria-label="Close form" onClick={() => setShowForm(false)}>×</button></div><form onSubmit={save} noValidate><div className="form-grid"><Field id="medicine-name" name="name" label="Medicine name" required maxLength={70} defaultValue={editing?.name || ''} placeholder="e.g. Vitamin D3" error={errors.name} /><Field id="medicine-dose" name="dose" label="Dose" required maxLength={40} defaultValue={editing?.dose || ''} placeholder="e.g. 1,000 IU" error={errors.dose} /><Field id="medicine-schedule" name="schedule" label="Time" type="time" required defaultValue={editing?.schedule || '08:00'} error={errors.schedule} /><Field id="medicine-frequency" name="frequency" label="Frequency" required maxLength={40} defaultValue={editing?.frequency || 'Daily'} error={errors.frequency} /><Field id="medicine-instructions" name="instructions" label="Instructions" className="form-field-wide" maxLength={120} defaultValue={editing?.instructions || ''} placeholder="e.g. Take with breakfast" error={errors.instructions} /><label className="field form-field-wide" htmlFor="medicine-notes"><span className="field-label">Notes (optional)</span><textarea id="medicine-notes" name="notes" maxLength={500} defaultValue={editing?.notes || ''} placeholder="Helpful details for your care circle" aria-invalid={Boolean(errors.notes)} aria-describedby={errors.notes ? 'medicine-notes-error' : undefined} />{errors.notes && <span className="field-error" id="medicine-notes-error">{errors.notes}</span>}</label></div><div className="form-actions"><Button variant="outline" onClick={() => { setShowForm(false); setErrors({}) }}>Cancel</Button><Button type="submit">{editing ? 'Save changes' : 'Add medicine'}</Button></div></form></section></div>}
    </>
}

export function MedicineDetailPage() {
    const { medicineId } = useParams()
    const data = useData()
    const navigate = useNavigate()
    const caretaker = getRolePermissions(data.profile.role).canManageMedicines
    const medicine = data.medicines.find((item) => item.id === medicineId)
    const history = data.doseLogs.filter((log) => log.medicineId === medicineId).sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
    const status = history.find((log) => log.date === today())?.status || 'upcoming'
    if (!medicine) return <div className="empty-state"><strong>Medicine not found</strong><Button onClick={() => navigate('/medicines')}>Back to medicines</Button></div>
    return <><PageHeader eyebrow="MEDICINE DETAILS" title={medicine.name} description="A clear view of this medicine and its recent history." action={<Link className="button button--outline" to="/medicines"><ArrowLeft size={17} /> All medicines</Link>} /><div className="two-column"><div className="stack"><Card><div className="section-heading"><div><p className="eyebrow">YOUR SCHEDULE</p><h2 className="section-title">{medicine.dose}</h2><p className="section-subtitle">{medicine.instructions || 'Follow the schedule provided by your care team.'}</p></div><StatusPill status={status}>{status === 'taken' ? 'Taken today' : status === 'missed' ? 'Missed today' : 'Upcoming'}</StatusPill></div><div className="detail-facts"><div><span>Time</span><strong>{formatTime(medicine.schedule)}</strong></div><div><span>Frequency</span><strong>{medicine.frequency}</strong></div><div><span>Notes</span><strong>{medicine.notes || 'No extra notes'}</strong></div></div>{caretaker && <div className="form-actions"><Button variant="outline" onClick={() => storage.markDose(medicine.id, 'missed')}>Mark missed</Button><Button onClick={() => storage.markDose(medicine.id, 'taken')}>Mark taken</Button></div>}</Card><Card><div className="section-heading"><div><h2 className="section-title">Recent history</h2><p className="section-subtitle">Dose check-ins saved on this device.</p></div></div><div className="history-list">{history.slice(0, 14).map((log) => <div className="history-row" key={log.id}><span className="history-date">{new Date(`${log.date}T12:00:00`).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span><span>{formatTime(log.time)}</span><StatusPill status={log.status}>{log.status === 'taken' ? 'Taken' : 'Missed'}</StatusPill></div>)}</div></Card></div><Card><p className="eyebrow">A HELPFUL REMINDER</p><h2 className="section-title">Questions about this medicine?</h2><p className="section-subtitle">Your care team can help you understand your schedule and instructions.</p><Link className="button button--outline button--full" to="/medicine-question">Ask the medicine helper</Link></Card></div></>
}
