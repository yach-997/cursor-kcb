import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
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

// 注册 SW：安卓 Chrome 一键「添加到桌面」依赖它；autoUpdate 减轻旧缓存锁死
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
