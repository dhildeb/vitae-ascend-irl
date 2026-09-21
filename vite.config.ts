import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/vitae-ascend-irl/',
  plugins: [react(), tailwindcss()],
})