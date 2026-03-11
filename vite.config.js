import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: '/preguntador/',
    plugins: [react()],
    server: {
        host: true, // expose on LAN so players can connect
    },
});
