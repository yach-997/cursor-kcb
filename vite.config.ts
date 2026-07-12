import { readFileSync, writeFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// 本地默认 './'；CI 也可注入 VITE_BASE
const base = process.env.VITE_BASE || './'
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8')) as {
  version: string
}

/** 构建时写出 version.json，供客户端检测升级 */
function emitVersionJson(): Plugin {
  const write = () => {
    const body = JSON.stringify(
      { version: pkg.version, builtAt: Date.now() },
      null,
      2,
    )
    writeFileSync('./public/version.json', `${body}\n`)
  }
  return {
    name: 'emit-version-json',
    buildStart() {
      write()
    },
    configureServer() {
      write()
    },
  }
}

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    emitVersionJson(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.png',
        'clear.html',
        'version.json',
      ],
      manifest: {
        name: '川轻化课表助手',
        short_name: '课表助手',
        description: '四川轻化工大学课表助手 · 本地课表',
        theme_color: '#0d6e5a',
        background_color: '#f3f7f5',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        lang: 'zh-CN',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,mjs,bcmap}'],
        globIgnores: ['**/version.json', '**/clear.html', '**/update.html'],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        navigateFallbackDenylist: [/clear\.html/, /update\.html/, /version\.json/],
        runtimeCaching: [
          {
            urlPattern: /\/version\.json$/i,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
})
