import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'reorder-css',
      transformIndexHtml(html) {
        const cssRegex = /<link rel="stylesheet" crossorigin href="([^"]+)">/g;
        const match = cssRegex.exec(html);
        if (!match) return html;
        const cssLink = match[0];
        let cleanHtml = html.replace(cssLink, '');
        return cleanHtml.replace('<head>', `<head>\n    ${cssLink}`);
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    legalComments: 'none',
  },
  build: {
    target: 'esnext',
    cssMinify: true,
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'framer-motion', 
      'lucide-react',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog'
    ],
  },
})

