/**
 * 清理 PWA / 浏览器缓存并强制刷新，用于手机拿到最新识别逻辑。
 * 默认保留课表 localStorage；需要时可一并清除。
 */
export async function hardRefreshApp(options?: {
  clearTimetable?: boolean
}): Promise<void> {
  try {
    sessionStorage.clear()
  } catch {
    /* ignore */
  }

  if (options?.clearTimetable) {
    try {
      const keys: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k) keys.push(k)
      }
      for (const k of keys) {
        if (k.startsWith('susuc-')) localStorage.removeItem(k)
      }
    } catch {
      /* ignore */
    }
  }

  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map((r) => r.unregister()))
    }
  } catch {
    /* ignore */
  }

  try {
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    }
  } catch {
    /* ignore */
  }

  // 带时间戳强制绕过缓存
  const url = new URL(window.location.href)
  url.searchParams.set('_refresh', String(Date.now()))
  window.location.replace(url.toString())
}
