/* global process */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { splitVendorChunkPlugin } from 'vite';
import compression from 'vite-plugin-compression';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';

  return {
    plugins: [
      react(),
      splitVendorChunkPlugin(),
      ViteImageOptimizer({
        jpg: {
          quality: 80,
        },
        jpeg: {
          quality: 80,
        },
        png: {
          quality: 80,
          compressionLevel: 9,
        },
        webp: {
          lossless: true,
        },
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'Parking Radar',
          short_name: 'ParkingRadar',
          description: 'Encuentra estacionamiento de manera fácil y rápida',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 // 24 horas
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /\.(png|jpg|jpeg|svg|gif)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
                }
              }
            }
          ]
        }
      }),
      isProduction && compression({
        algorithm: 'gzip',
        ext: '.gz',
      }),
      isProduction && compression({
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
    ],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    base: '/',
    server: {
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BACKEND_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      rollupOptions: {
        input: '/index.html',
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'auth0': ['@auth0/auth0-react'],
            'maps': ['@react-google-maps/api'],
            'query': ['@tanstack/react-query'],
            'ui': ['framer-motion', 'lucide-react', 'react-icons'],
          },
        },
      },
      target: 'esnext',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
        },
      },
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', '@auth0/auth0-react', '@tanstack/react-query'],
    },
  };
});
