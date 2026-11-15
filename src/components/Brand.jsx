export function Brand({ compact = false }) {
    return (
        <div className={`brand ${compact ? 'brand--compact' : ''}`} aria-label="CareCircle">
            <span className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 48 48" role="img" aria-label="">
                    <path d="M24 39S7.5 29.7 7.5 18.5A9.5 9.5 0 0 1 24 12.2a9.5 9.5 0 0 1 16.5 6.3C40.5 29.7 24 39 24 39Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
                    <path d="M13 24h7l3-6 4.5 13 3-7H36" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </span>
            {!compact && <span className="brand-name">Care<span>Circle</span></span>}
        </div>
    )
}
