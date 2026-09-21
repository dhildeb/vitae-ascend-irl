import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/vitae-ascend-irl/',
  plugins: [react()],
})