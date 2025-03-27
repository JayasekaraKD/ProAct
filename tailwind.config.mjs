/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#1a3c61',
            },
        },
    },
    plugins: [],
}