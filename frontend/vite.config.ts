import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({ open: true }),
    react(),
    ViteImageOptimizer({
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        quality: 80,
      },
      svg: {
        multipass: true,
      },
    }),
  ],
  build: {
    assetsInlineLimit: 4096, // Inlinear assets < 4kb
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-email': ['@emailjs/browser'],
          'vendor-icons': ['@boxicons/react'],
        },
      },
    },
  },
})