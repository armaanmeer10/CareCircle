/** Render a consistently styled, keyboard-operable action button. */
export function Button({ variant = 'primary', size = 'md', className = '', type = 'button', ...props }) {
    return <button type={type} className={['button', `button--${variant}`, `button--${size}`, className].filter(Boolean).join(' ')} {...props} />
}

/** Render a standard elevated panel. */
export function Card({ className = '', children, ...props }) {
    return <section className={['card', className].filter(Boolean).join(' ')} {...props}>{children}</section>
}

/** Render a page title, optional description, and actions. */
export function PageHeader({ eyebrow, title, description, action }) {
    return <div className="page-header"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div>{action && <div className="page-header-action">{action}</div>}</div>
}

/** Present a compact dose or appointment status. */
export function StatusPill({ status = 'upcoming', children }) {
    return <span className={`status-pill status-pill--${status}`}>{children}</span>
}

/** Render a labeled input with linked hint and validation error text. */
export function Field({ label, id, hint, error, className = '', ...props }) {
    return <label className={['field', className].filter(Boolean).join(' ')} htmlFor={id}><span className="field-label">{label}</span><input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} {...props} />{hint && <span className="field-hint" id={`${id}-hint`}>{hint}</span>}{error && <span className="field-error" id={`${id}-error`}>{error}</span>}</label>
}
