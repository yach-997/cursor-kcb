import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { installPdfCompat } from './lib/pdfCompat'
import App from './App'
import './index.css'

installPdfCompat()

// 去掉强制刷新参数
try {
  const u = new URL(window.location.href)
  ;['_refresh', '_v', 'cleared'].forEach((k) => u.searchParams.delete(k))
  window.history.replaceState(null, '', u.toString())
} catch {
  /* ignore */
}

// 每次启动都注销 SW，避免再次被旧缓存锁死（暂时关闭 PWA 离线）
void (async () => {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map((r) => r.unregister()))
    }
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    }
  } catch {
    /* ignore */
  }
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
