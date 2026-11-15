import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        setupFiles: './src/test/setup.js',
        css: true,
        coverage: {
            provider: 'v8',
            include: ['src/lib/**/*.js'],
            exclude: ['src/lib/**/*.test.js', 'src/lib/assets.js'],
            thresholds: { lines: 70, functions: 70, branches: 70, statements: 70 },
        },
    },
})
