import path from 'path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      png:  { quality: 80 },
      jpeg: { quality: 80 },
      jpg:  { quality: 80 },
      webp: { quality: 80 },
      svg:  { multipass: true },
    }),
    // Genera stats.html en la raíz al correr `vite build`.
    // Abrilo en el browser para analizar el bundle.
    visualizer({
      filename: 'stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],

  resolve: {
    alias: {
      // Permite usar @/ en vez de rutas relativas largas
      // Ej: import { useAuth } from '@/hooks/useAuth'
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    // Assets < 4kb se inlinean como base64 (fuentes y SVGs grandes NO)
    assetsInlineLimit: 4096,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core de React (cambia rara vez -> cacheable por mucho tiempo)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // EmailJS solo se carga cuando el carrito se usa
          'vendor-email': ['@emailjs/browser'],
          // Iconos (chunk separado, se comparte entre Header y paginas)
          'vendor-icons': ['@boxicons/react'],
          // SDK de Cloudinary separado del resto de la app
          'vendor-cloudinary': ['@cloudinary/url-gen', '@cloudinary/react'],
        },
      },
    },
  },
});
