/** 清掉 PWA 缓存并强制重新加载最新页面（给小白用的一键刷新） */
export async function forceRefreshApp(): Promise<void> {
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

  // 加时间戳，尽量绕过浏览器缓存
  const url = new URL(window.location.href)
  url.searchParams.set('_refresh', String(Date.now()))
  window.location.replace(url.toString())
}
