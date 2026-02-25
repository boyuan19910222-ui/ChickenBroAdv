import { defineConfig } from '@playwright/test'

export default defineConfig({
    testDir: './tests/e2e-pw',
    timeout: 90000,
    expect: {
        timeout: 10000,
    },
    use: {
        baseURL: 'http://localhost:3000',
        headless: true,
        screenshot: 'only-on-failure',
    },
    webServer: [
        {
            command: 'npx vite --port 3000',
            port: 3000,
            reuseExistingServer: true,
            timeout: 30000,
        },
        {
            command: 'node server/index.js',
            port: 3001,
            reuseExistingServer: true,
            timeout: 15000,
        },
    ],
    projects: [
        {
            name: 'chromium',
            use: { browserName: 'chromium' },
        },
    ],
})
