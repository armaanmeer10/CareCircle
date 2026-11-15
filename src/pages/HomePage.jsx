import { useMemo, useRef } from 'react'
import { ArrowRight, Bell, CalendarDays, Check, Clock3, Heart, Phone, RotateCcw, Sparkles, ClipboardList } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, Card, PageHeader, StatusPill } from '../components/UI.jsx'
import { storage, today } from '../lib/storage.js'
import { elderPortrait } from '../lib/assets.js'
import { useData, useNotice } from '../lib/useData.js'

const displayTime = (time) => new Date(`2000-01-01T${time}:00`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
const displayDate = (date, options = { weekday: 'long', month: 'long', day: 'numeric' }) => new Date(`${date}T12:00:00`).toLocaleDateString([], options)

export default function HomePage() {
    const data = useData()
    const notify = useNotice()
    const day = today()
    const reminderTimer = useRef(null)
    const todaysLogs = data.doseLogs.filter((log) => log.date === day)
    const timeline = useMemo(() => [...data.medicines].sort((a, b) => a.schedule.localeCompare(b.schedule)), [data.medicines])
    const nextMedicine = timeline.find((medicine) => !todaysLogs.some((log) => log.medicineId === medicine.id && log.status === 'taken'))
    const nextAppointment = [...data.appointments].filter((item) => item.date >= day).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0]

    function mark(medicineId, status = 'taken') {
        storage.markDose(medicineId, status)
        const medicine = data.medicines.find((item) => item.id === medicineId)
        notify(`${medicine?.name || 'Medicine'} marked ${status}.`)
    }

    function remindLater() {
        window.clearTimeout(reminderTimer.current)
        reminderTimer.current = window.setTimeout(() => notify('Your medicine reminder is ready.'), 15 * 60 * 1000)
        notify('A reminder is set for 15 minutes from now on this device.')
    }

    return <>
        <PageHeader eyebrow={displayDate(day)} title={`Good morning, ${data.profile.name}`} description="One day at a time. Your care circle is right here with you." action={<Link className="button button--outline" to="/medicines"><ClipboardList size={17} /> View medicines</Link>} />
        <div className="home-welcome card"><div className="welcome-copy"><span className="welcome-spark"><Sparkles size={18} /></span><div><p className="eyebrow">A FRESH START</p><h2>You’re doing great, {data.profile.name}.</h2><p>Your care plan is ready when you are. Let’s take today one step at a time.</p></div></div><img src={elderPortrait} alt="Papa smiling warmly" /></div>
        <div className="home-grid">
            <div className="stack">
                <Card className="next-dose-card"><div className="section-heading"><div><p className="eyebrow">UP NEXT</p><h2 className="section-title">Your next medicine</h2></div><span className="dose-time"><Clock3 size={16} /> {nextMedicine ? displayTime(nextMedicine.schedule) : 'All done'}</span></div>{nextMedicine ? <><div className="medicine-hero"><span className="medicine-symbol"><Heart size={25} /></span><div><h3>{nextMedicine.name}</h3><p>{nextMedicine.dose} · {nextMedicine.instructions}</p></div><StatusPill status="upcoming">Up next</StatusPill></div><div className="dose-actions"><Button size="lg" onClick={() => mark(nextMedicine.id)}><Check size={19} /> I took it</Button><Button variant="outline" size="lg" onClick={remindLater}><RotateCcw size={18} /> Remind me in 15 minutes</Button></div></> : <div className="all-done"><span><Check size={24} /></span><div><strong>All caught up for today.</strong><p>You’ve checked in on every scheduled medicine.</p></div></div>}</Card>
                <Card><div className="section-heading"><div><h2 className="section-title">Today’s timeline</h2><p className="section-subtitle">Your daily medicines, in a simple list.</p></div><Link className="text-link" to="/medicines">See all</Link></div><div className="timeline">{timeline.map((medicine) => { const log = todaysLogs.find((item) => item.medicineId === medicine.id); const status = log?.status || 'upcoming'; return <div className="timeline-row" key={medicine.id}><div className={`timeline-marker timeline-marker--${status}`}><span /></div><time>{displayTime(medicine.schedule)}</time><div className="timeline-content"><strong>{medicine.name}</strong><span>{medicine.dose}</span></div>{status === 'upcoming' ? <Button variant="ghost" onClick={() => mark(medicine.id)}>Mark taken</Button> : <StatusPill status={status}>{status === 'taken' ? 'Taken' : 'Missed'}</StatusPill>}</div> })}</div></Card>
            </div>
            <div className="stack">
                <Card className="appointment-card"><div className="section-heading"><div><h2 className="section-title">Your next appointment</h2><p className="section-subtitle">A little preparation goes a long way.</p></div><span className="appointment-icon"><CalendarDays size={20} /></span></div>{nextAppointment ? <><div className="appointment-date"><strong>{new Date(`${nextAppointment.date}T12:00:00`).getDate()}</strong><span>{new Date(`${nextAppointment.date}T12:00:00`).toLocaleDateString([], { month: 'short' }).toUpperCase()}</span></div><div className="appointment-info"><strong>{nextAppointment.provider || nextAppointment.title}</strong><span>{displayDate(nextAppointment.date, { weekday: 'short', month: 'short', day: 'numeric' })} · {displayTime(nextAppointment.time)}</span><span>{nextAppointment.location}</span></div><Link className="text-link" to="/appointments">Appointment details <ArrowRight size={15} /></Link></> : <p className="muted">No upcoming appointments.</p>}</Card>
                <Card className="family-card"><div className="family-avatars"><img src={elderPortrait} alt="Papa" /><span>EW</span><span>MW</span></div><p className="eyebrow">YOUR PEOPLE ARE HERE</p><h2 className="section-title">A familiar voice can make the day.</h2><p className="section-subtitle">Your care circle is just one call away.</p><a className="button button--secondary button--full call-family" href={`tel:${data.profile.phone.replace(/[^\d+]/g, '')}`}><Phone size={18} /> Call my family</a><Link className="family-link" to="/circle">See your care circle <ArrowRight size={15} /></Link></Card>
                <div className="gentle-note"><Bell size={16} /><span>Your reminders are set to be gentle and helpful.</span></div>
            </div>
        </div>
    </>
}

