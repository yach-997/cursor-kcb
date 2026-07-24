import { useEffect, useMemo, useState } from 'react'
import {
  VISIT_BASE,
  fakeVisitGrowth,
  formatVisitCount,
} from '../lib/visitStats'

const BUSUANZI_SRC =
  'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js'
const CACHE_KEY = 'susuc-visit-total'

function readBusuanziPv(): number {
  const el = document.getElementById('busuanzi_value_site_pv')
  if (!el) return 0
  const n = Number(String(el.textContent || '').replace(/[^\d]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function readCachedTotal(): number | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const n = Number(raw)
    return Number.isFinite(n) && n > 0 ? n : null
  } catch {
    return null
  }
}

function writeCachedTotal(n: number) {
  try {
    localStorage.setItem(CACHE_KEY, String(n))
  } catch {
    /* ignore */
  }
}

/**
 * 避免刷新时先闪「基础+虚增」、再跳到含真实 PV 的数字。
 * 优先展示上次缓存；等不蒜子就绪后再更新。
 */
function useVisitTotal(): number | null {
  const fake = useMemo(() => fakeVisitGrowth(), [])
  const [display, setDisplay] = useState<number | null>(() => readCachedTotal())

  useEffect(() => {
    let alive = true
    let tries = 0
    let settled = false

    const apply = (real: number) => {
      if (!alive) return
      const next = VISIT_BASE + fake + real
      setDisplay(next)
      writeCachedTotal(next)
      settled = true
    }

    const pull = () => {
      if (!alive || settled) return
      const n = readBusuanziPv()
      if (n > 0) {
        apply(n)
        return
      }
      tries += 1
      // 超时仍无真实数：用缓存；无缓存才用基础+虚增，并写入缓存避免下次再闪
      if (tries >= 40) {
        const cached = readCachedTotal()
        if (cached != null) {
          setDisplay(cached)
        } else {
          apply(0)
        }
        settled = true
      }
    }

    if (!document.getElementById('busuanzi_value_site_pv')) {
      const span = document.createElement('span')
      span.id = 'busuanzi_value_site_pv'
      span.setAttribute('aria-hidden', 'true')
      span.style.display = 'none'
      document.body.appendChild(span)
    }

    if (!document.querySelector(`script[src="${BUSUANZI_SRC}"]`)) {
      const s = document.createElement('script')
      s.src = BUSUANZI_SRC
      s.async = true
      s.onload = () => pull()
      document.body.appendChild(s)
    } else {
      pull()
    }

    const timer = window.setInterval(() => {
      if (!settled) pull()
    }, 500)

    return () => {
      alive = false
      window.clearInterval(timer)
    }
  }, [fake])

  return display
}

/** 底部导航上方：有无课表都常驻可见 */
export function VisitCountHint() {
  const total = useVisitTotal()
  return (
    <p className="text-center text-[0.65rem] tabular-nums tracking-wide text-muted">
      累计访问量 {total == null ? '…' : formatVisitCount(total)}
    </p>
  )
}
