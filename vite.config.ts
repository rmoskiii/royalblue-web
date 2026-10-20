import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { imagetools } from 'vite-imagetools';
import {
  browserSecurityHeaders,
  developmentCsp,
} from './src/lib/securityHeaders.ts';

export default defineConfig({
  // imagetools resizes and converts images imported with a query, e.g. '?w=…&format=webp&as=srcset'
  plugins: [react(), tailwindcss(), imagetools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    headers: browserSecurityHeaders(developmentCsp, false),
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    headers: browserSecurityHeaders(developmentCsp, false),
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      include: [
        'src/lib/format.ts',
        'src/features/auth/lib/passwordRules.ts',
        'src/features/loans/lib/amortization.ts',
        'src/features/transactions/transactionDisplay.ts',
        'src/features/verification/addressCopy.ts',
        'src/features/insights/spendCategories.ts',
        'src/lib/securityHeaders.ts',
      ],
    },
  },
});
