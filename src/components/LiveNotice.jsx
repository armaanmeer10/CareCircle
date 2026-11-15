import { useCurrentNotice } from '../lib/useData.js'

export default function LiveNotice() {
    const message = useCurrentNotice()
    return message ? <div className="notice" role="status" aria-live="polite">{message}</div> : null
}
