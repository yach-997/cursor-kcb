/**
 * 跳转到独立清理页（不走 React / 旧 SW 逻辑），确保手机真能刷到新版。
 */
export function hardRefreshApp(options?: { clearTimetable?: boolean }): void {
  const base = import.meta.env.BASE_URL || '/'
  const url = new URL('clear.html', `${window.location.origin}${base}`)
  url.searchParams.set('t', String(Date.now()))
  if (options?.clearTimetable) url.searchParams.set('data', '1')
  // 用 assign 而不是 replace，部分安卓 PWA 对 replace 不刷新
  window.location.href = url.href
}

export function clearPageUrl(clearTimetable = false): string {
  const base = import.meta.env.BASE_URL || '/'
  const url = new URL('clear.html', `${window.location.origin}${base}`)
  url.searchParams.set('t', String(Date.now()))
  if (clearTimetable) url.searchParams.set('data', '1')
  return url.href
}
