import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

declare global {
  interface Window {
    _hmt?: Array<unknown[]>
  }
}

/** Hash 路由切换时补报 PV，方便看各页访问 */
export function BaiduAnalytics() {
  const { pathname } = useLocation()

  useEffect(() => {
    try {
      window._hmt = window._hmt || []
      window._hmt.push(['_trackPageview', `/#${pathname}`])
    } catch {
      /* ignore */
    }
  }, [pathname])

  return null
}
