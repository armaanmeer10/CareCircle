import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Activity, CalendarDays, ChevronDown, CircleHelp, ClipboardList, Heart, Home, LogOut, Mail, Menu, Settings, ShieldCheck, Users, X } from 'lucide-react'
import { Brand } from './Brand.jsx'
import { storage } from '../lib/storage.js'
import { elderPortrait } from '../lib/assets.js'

const links = [
    { to: '/home', label: 'Today', icon: Home, roles: ['Elder', 'Caretaker', 'Family'] },
    { to: '/medicines', label: 'Medicines', icon: ClipboardList, roles: ['Elder', 'Caretaker', 'Family'] },
    { to: '/appointments', label: 'Appointments', icon: CalendarDays, roles: ['Elder', 'Caretaker', 'Family'] },
    { to: '/dashboard', label: 'Care overview', icon: Activity, roles: ['Caretaker'] },
    { to: '/insights', label: 'Weekly insights', icon: Activity, roles: ['Family', 'Caretaker'] },
    { to: '/circle', label: 'Care circle', icon: Users, roles: ['Caretaker', 'Family'] },
    { to: '/reminders', label: 'Reminders', icon: Heart, roles: ['Caretaker'] },
    { to: '/email-preview', label: 'Email preview', icon: Mail, roles: ['Caretaker'] },
]
const utilityLinks = [
    { to: '/settings', label: 'Settings & access', icon: Settings },
    { to: '/medicine-question', label: 'Medicine helper', icon: CircleHelp },
]

export default function AppLayout({ data, children }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const [roleMenu, setRoleMenu] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const role = data.profile.role || 'Elder'
    const visibleLinks = links.filter((item) => item.roles.includes(role))
    const pageName = [...links, ...utilityLinks].find((item) => item.to === location.pathname)?.label || 'Your care, together'

    function switchRole(nextRole) {
        storage.setRole(nextRole)
        setRoleMenu(false)
        navigate(nextRole === 'Caretaker' ? '/dashboard' : nextRole === 'Family' ? '/insights' : '/home')
    }

    return (
        <div className="app-shell">
            <aside className={`sidebar ${menuOpen ? 'sidebar--open' : ''}`} aria-label="Main navigation">
                <div className="sidebar-top"><Brand /><button className="icon-button sidebar-close" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X size={20} /></button></div>
                <div className="sidebar-profile"><img src={elderPortrait} alt="Papa smiling" width="42" height="42" /><div><strong>{data.profile.name}</strong><span>Care plan</span></div><ShieldCheck size={18} aria-label="Care plan protected" /></div>
                <p className="nav-label">YOUR CARE</p>
                <nav className="nav-list">{visibleLinks.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`} onClick={() => setMenuOpen(false)}><Icon size={20} strokeWidth={1.8} /><span>{label}</span></NavLink>)}</nav>
                <p className="nav-label nav-label--space">SUPPORT</p>
                <nav className="nav-list">{utilityLinks.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`} onClick={() => setMenuOpen(false)}><Icon size={20} strokeWidth={1.8} /><span>{label}</span></NavLink>)}</nav>
                <div className="sidebar-bottom"><div className="sidebar-help"><Heart size={18} /><span>Care works better<br />when we do it together.</span></div><button className="logout-button" onClick={() => { storage.setRole(null); navigate('/access') }}><LogOut size={18} /> Switch or sign out</button></div>
            </aside>
            {menuOpen && <button className="sidebar-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
            <div className="main-column">
                <header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={22} /></button><div className="breadcrumbs"><span>CareCircle</span><span className="breadcrumb-divider">/</span><strong>{pageName}</strong></div><div className="topbar-actions"><div className="role-switcher-wrap"><button className="role-badge" aria-expanded={roleMenu} onClick={() => setRoleMenu(!roleMenu)}><span className="role-avatar">{role[0]}</span><span>{role}</span><ChevronDown size={16} /></button>{roleMenu && <div className="role-menu" role="menu">{['Elder', 'Caretaker', 'Family'].map((item) => <button key={item} role="menuitem" onClick={() => switchRole(item)}>{item}{item === role && <span aria-label="current role">✓</span>}</button>)}</div>}</div><img className="topbar-avatar" src={elderPortrait} alt="Papa profile" width="42" height="42" /></div></header>
                <main className="page-content">{children || <Outlet />}</main>
                <footer className="app-footer"><span>Made with care, for care.</span><span>Need help? <a href="mailto:hello@carecircle.example" rel="noopener noreferrer">We’re here for you</a></span></footer>
            </div>
        </div>
    )
}
