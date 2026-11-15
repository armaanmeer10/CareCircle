import { useEffect, useState, useSyncExternalStore } from 'react'
import { storage } from './storage.js'

/** Subscribe a component to the local care-data snapshot. */
export function useData() {
    return useSyncExternalStore(storage.subscribe, storage.getSnapshot, storage.getSnapshot)
}

/** Return a dispatcher for the shared polite status-notice event. */
export function useNotice() {
    return (message) => {
        window.dispatchEvent(new CustomEvent('carecircle:notice', { detail: message }))
    }
}

/** Listen for notices and automatically clear them after a short interval. */
export function useCurrentNotice() {
    // Imported here so all feedback uses one polite, accessible live region.
    const [message, setMessage] = useState('')
    useEffect(() => {
        let timer
        const show = (event) => {
            setMessage(event.detail)
            window.clearTimeout(timer)
            timer = window.setTimeout(() => setMessage(''), 3200)
        }
        window.addEventListener('carecircle:notice', show)
        return () => { window.removeEventListener('carecircle:notice', show); window.clearTimeout(timer) }
    }, [])
    return message
}
