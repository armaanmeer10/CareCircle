import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, LockKeyhole, ShieldCheck, UsersRound } from 'lucide-react'
import { Brand } from '../components/Brand.jsx'
import { Button, Field } from '../components/UI.jsx'
import { storage } from '../lib/storage.js'

const roles = [
    { name: 'Elder', title: 'I’m receiving care', description: 'A simple view of today, your medicines, and the people by your side.', icon: <HeartIcon /> },
    { name: 'Caretaker', title: 'I help with care', description: 'Stay on top of medicines, appointments, and check-ins.', icon: <ShieldCheck size={24} /> },
    { name: 'Family', title: 'I’m part of the family', description: 'See updates and feel close, even from a little farther away.', icon: <UsersRound size={24} /> },
]

export function AccessPage() {
    const [passcode, setPasscode] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()
    function submit(event) {
        event.preventDefault()
        if (!/^\d{6}$/.test(passcode)) { setError('Enter your 6-digit passcode.'); return }
        if (!storage.verifyPasscode(passcode)) { setError('That passcode didn’t match. Please try again.'); return }
        setError('')
        storage.grantAccess()
        navigate(storage.getSnapshot().profile.role ? '/home' : '/role')
    }
    return <main className="auth-screen"><div className="auth-decoration auth-decoration--one" /><div className="auth-decoration auth-decoration--two" /><section className="auth-card"><div className="auth-brand"><Brand /></div><div className="auth-icon"><LockKeyhole size={26} /></div><p className="eyebrow">A LITTLE HELP, A LOT OF HEART</p><h1>Care feels better<br />when we’re <span>together.</span></h1><p className="auth-copy">A calm, simple place to keep care connected. Welcome back.</p><form onSubmit={submit} className="auth-form"><Field id="passcode" label="Your 6-digit passcode" type="password" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="••••••" value={passcode} onChange={(event) => { setPasscode(event.target.value.replace(/\D/g, '')); setError('') }} error={error} /><Button type="submit" size="lg" className="auth-submit">Continue <ArrowRight size={19} /></Button></form><div className="privacy-note"><ShieldCheck size={17} /><span>Your family’s care information stays private.</span></div><p className="demo-hint">Demo passcode: <strong>123456</strong></p></section><div className="auth-footer"><span>Made with care, for care.</span><span>Gentle support for every day.</span></div></main>
}

export function RolePage() {
    const navigate = useNavigate()
    function choose(role) { storage.setRole(role); navigate(role === 'Caretaker' ? '/dashboard' : role === 'Family' ? '/insights' : '/home') }
    return <main className="role-screen"><header className="role-page-header"><Brand /><div className="role-header-actions"><Link className="role-back-link" to="/access"><ArrowLeft size={17} /> Back to passcode</Link><span className="privacy-note"><ShieldCheck size={17} /> Private family space</span></div></header><section className="role-content"><p className="eyebrow">WELCOME TO YOUR CARE CIRCLE</p><h1>How are you part<br />of the care team?</h1><p className="page-description">We’ll make this feel right for you. You can change your view anytime.</p><div className="role-cards">{roles.map((role) => <button className="role-card" key={role.name} onClick={() => choose(role.name)}><span className="role-card-icon">{role.icon}</span><span className="role-card-content"><strong>{role.title}</strong><span>{role.description}</span></span><span className="role-arrow"><ArrowRight size={20} /></span></button>)}</div><p className="role-reassurance"><Check size={16} /> You’re always in control of what you share.</p></section></main>
}

function HeartIcon() { return <span className="elder-icon" aria-hidden="true">♡</span> }
