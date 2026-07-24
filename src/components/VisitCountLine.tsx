import { useEffect, useMemo, useState } from 'react'
import {
  VISIT_BASE,
  fakeVisitGrowth,
  formatVisitCount,
} from '../lib/visitStats'

const BUSUANZI_SRC =
  'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js'

function readBusuanziPv(): number {
  const el = document.getElementById('busuanzi_value_site_pv')
  if (!el) return 0
  const n = Number(String(el.textContent || '').replace(/[^\d]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function useVisitTotal(): number {
  const fake = useMemo(() => fakeVisitGrowth(), [])
  const [real, setReal] = useState(0)

  useEffect(() => {
    let alive = true
    let tries = 0

    const pull = () => {
      if (!alive) return
      const n = readBusuanziPv()
      if (n > 0) setReal(n)
      tries += 1
      if (n === 0 && tries < 40) window.setTimeout(pull, 500)
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

    const timer = window.setInterval(pull, 2000)
    return () => {
      alive = false
      window.clearInterval(timer)
    }
  }, [])

  return VISIT_BASE + fake + real
}

/** 首页标题旁：轻量一行，不另起色块 */
export function VisitCountHint() {
  const total = useVisitTotal()
  return (
    <span className="shrink-0 text-[0.7rem] tabular-nums text-muted">
      累计 {formatVisitCount(total)}
    </span>
  )
}
