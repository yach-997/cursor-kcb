import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { installPdfCompat } from './lib/pdfCompat'
import App from './App'
import './index.css'

installPdfCompat()

// 去掉强制刷新留下的查询参数，避免地址栏难看
try {
  const u = new URL(window.location.href)
  if (u.searchParams.has('_refresh')) {
    u.searchParams.delete('_refresh')
    window.history.replaceState(null, '', u.toString())
  }
} catch {
  /* ignore */
}

// 有新版本时立刻启用，避免手机一直用旧缓存导致 PDF 识别修不好
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    void updateSW(true)
  },
  onRegisteredSW(_url, registration) {
    if (registration) {
      void registration.update()
      window.setInterval(() => void registration.update(), 60_000)
    }
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
