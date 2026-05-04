import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // ensure relative paths work on Firebase
  plugins: [react()],
  
  define: {
    'process.env': {},
    'process': {},
    'global': 'globalThis',
    'import.meta.env.VITE_REMOVE_LOGS': process.env.NODE_ENV === 'production',
  },
  
  optimizeDeps: {
    include: ['axios', 'react-hot-toast', 'dompurify', 'xss'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        timeout: 30000,
        ws: true,
      },
    },
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash]-v4.js',
        chunkFileNames: 'assets/[name]-[hash]-v4.js',
        assetFileNames: 'assets/[name]-[hash]-v4.[ext]'
      }
    }
  },
  
  preview: {
    port: 4173,
    host: true,
    strictPort: true,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    target: 'es2020',
  },
  
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@services': '/src/services',
      '@utils': '/src/utils',
      '@context': '/src/context',
      '@hooks': '/src/hooks',
    },
  },
  
  css: {
    devSourcemap: process.env.NODE_ENV !== 'production',
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: process.env.NODE_ENV === 'production' 
        ? '[hash:base64:8]' 
        : '[name]__[local]__[hash:base64:5]',
    },
  },
})