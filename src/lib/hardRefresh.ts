/**
 * 清理 SW / Cache 后刷新。
 *
 * 注意：不要跳 clear.html（旧 SW 会劫持），也不要走 blob: 中转
 *（华为等国产浏览器常把 blob→https 判成「网站无法打开」）。
 */
export async function hardRefreshApp(options?: {
  clearTimetable?: boolean
}): Promise<void> {
  const clearData = Boolean(options?.clearTimetable)
  const base = import.meta.env.BASE_URL || '/'
  const home =
    `${window.location.origin}${base}?_v=${Date.now()}` +
    (clearData ? '&cleared=1' : '') +
    '#/'

  try {
    try {
      sessionStorage.clear()
    } catch {
      /* ignore */
    }

    if (clearData) {
      try {
        const keys: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i)
          if (k?.startsWith('susuc-')) keys.push(k)
        }
        keys.forEach((k) => localStorage.removeItem(k))
      } catch {
        /* ignore */
      }
    }

    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map((r) => r.unregister()))
    }

    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    }
  } catch {
    /* 仍继续跳转 */
  }

  window.location.replace(home)
}

export function clearPageUrl(clearTimetable = false): string {
  const base = import.meta.env.BASE_URL || '/'
  const url = new URL(`${window.location.origin}${base}`)
  url.searchParams.set('_v', String(Date.now()))
  if (clearTimetable) url.searchParams.set('cleared', '1')
  url.hash = '/'
  return url.href
}
