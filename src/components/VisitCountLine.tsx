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

/** 设置页等：一行文字 */
export function VisitCountLine({ className = '' }: { className?: string }) {
  const total = useVisitTotal()
  return (
    <p className={className}>累计访问 {formatVisitCount(total)}</p>
  )
}

/** 首页顶部：更显眼的条 */
export function VisitCountBanner() {
  const total = useVisitTotal()
  return (
    <div className="mx-3 mt-2 flex items-center justify-between gap-2 rounded-xl border border-brand/25 bg-brand-soft px-3 py-2">
      <span className="text-[0.75rem] font-medium text-brand-dark">
        已有同学在用
      </span>
      <span className="text-sm font-bold tabular-nums text-brand-dark">
        累计访问 {formatVisitCount(total)}
      </span>
    </div>
  )
}
