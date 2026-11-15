import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useSyncExternalStore } from 'react'
import AppLayout from './components/AppLayout.jsx'
import LiveNotice from './components/LiveNotice.jsx'
import { AccessPage, RolePage } from './pages/AccessPages.jsx'
import HomePage from './pages/HomePage.jsx'
import { MedicineDetailPage, MedicinesPage } from './pages/MedicinesPage.jsx'
import AppointmentsPage from './pages/AppointmentsPage.jsx'
import { CareCirclePage, CaretakerDashboardPage, EmailPreviewPage, FamilyInsightsPage, MedicineHelperPage, ReminderSettingsPage, SettingsPage } from './pages/InsightsPages.jsx'
import { storage } from './lib/storage.js'

const roleAccess = {
    '/dashboard': ['Caretaker'],
    '/insights': ['Family', 'Caretaker'],
    '/circle': ['Caretaker', 'Family'],
    '/reminders': ['Caretaker'],
    '/email-preview': ['Caretaker'],
}

function ProtectedLayout() {
    const data = useSyncExternalStore(storage.subscribe, storage.getSnapshot, storage.getSnapshot)
    const location = useLocation()
    if (!storage.hasAccess()) return <Navigate to="/access" replace state={{ from: location.pathname }} />
    if (!data.profile.role) return <Navigate to="/role" replace />
    const allowedRoles = roleAccess[location.pathname]
    if (allowedRoles && !allowedRoles.includes(data.profile.role)) return <Navigate to={data.profile.role === 'Family' ? '/insights' : '/home'} replace />
    return <div className={data.settings.highContrast ? 'high-contrast' : ''}><div className={data.settings.textSize === 'large' ? 'text-large' : data.settings.textSize === 'larger' ? 'text-larger' : ''}><AppLayout data={data} /><LiveNotice /></div></div>
}

function AuthPage({ children }) {
    const data = useSyncExternalStore(storage.subscribe, storage.getSnapshot, storage.getSnapshot)
    const location = useLocation()
    if (location.pathname === '/role' && !storage.hasAccess()) return <Navigate to="/access" replace />
    return data.profile.role && storage.hasAccess() ? <Navigate to="/home" replace /> : children
}

export default function App() {
    return <Routes>
        <Route path="/access" element={<AuthPage><AccessPage /></AuthPage>} />
        <Route path="/role" element={<AuthPage><RolePage /></AuthPage>} />
        <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/medicines" element={<MedicinesPage />} />
            <Route path="/medicines/:medicineId" element={<MedicineDetailPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/dashboard" element={<CaretakerDashboardPage />} />
            <Route path="/insights" element={<FamilyInsightsPage />} />
            <Route path="/circle" element={<CareCirclePage />} />
            <Route path="/reminders" element={<ReminderSettingsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/email-preview" element={<EmailPreviewPage />} />
            <Route path="/medicine-question" element={<MedicineHelperPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
}
