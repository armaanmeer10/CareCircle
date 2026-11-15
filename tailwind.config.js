/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                primary: 'var(--color-primary)',
                'primary-container': 'var(--color-primary-container)',
                secondary: 'var(--color-secondary)',
                tertiary: 'var(--color-tertiary)',
                surface: 'var(--color-surface)',
                'on-surface': 'var(--color-on-surface)',
            },
            fontFamily: {
                sans: ['Atkinson Hyperlegible Next', 'sans-serif'],
            },
            borderRadius: {
                card: 'var(--radius-md)',
            },
        },
    },
    plugins: [],
}
