/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig, ViteUserConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tsconfigPaths()] as ViteUserConfig['plugins'],
  test: {
    environment: 'jsdom',
  },
})
