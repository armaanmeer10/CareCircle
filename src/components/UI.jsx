export function Button({ variant = 'primary', size = 'md', className = '', type = 'button', ...props }) {
    return <button type={type} className={['button', `button--${variant}`, `button--${size}`, className].filter(Boolean).join(' ')} {...props} />
}

export function Card({ className = '', children, ...props }) {
    return <section className={['card', className].filter(Boolean).join(' ')} {...props}>{children}</section>
}

export function PageHeader({ eyebrow, title, description, action }) {
    return <div className="page-header"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div>{action && <div className="page-header-action">{action}</div>}</div>
}

export function StatusPill({ status = 'upcoming', children }) {
    return <span className={`status-pill status-pill--${status}`}>{children}</span>
}

export function Field({ label, id, hint, error, ...props }) {
    return <label className="field" htmlFor={id}><span className="field-label">{label}</span><input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} {...props} />{hint && <span className="field-hint" id={`${id}-hint`}>{hint}</span>}{error && <span className="field-error" id={`${id}-error`}>{error}</span>}</label>
}
