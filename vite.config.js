import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/CDZ-READER/',
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
