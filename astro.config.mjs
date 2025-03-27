import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
    output: 'server',
    adapter: vercel({
        analytics: true,  // Enable Vercel analytics
        maxDuration: 60,  // Function timeout in seconds
        webAnalytics: {
            enabled: true
        }
    }),
    integrations: [
        tailwind({
            applyBaseStyles: false,
        }),
        react(),
    ]
});