/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig, UserConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tsconfigPaths()] as UserConfig['plugins'],
  test: {
    environment: 'jsdom',
  },
})
