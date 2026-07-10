import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BOOKMARKLET_TARGET_PLACEHOLDER,
  buildBookmarkletSource,
  minifyBookmarklet,
} from '../lib/bookmarklet'
import { PASTE_EXAMPLE, parsePastedTimetable } from '../lib/parsePaste'
import { buildMockPayload } from '../lib/mockData'
import type { TimetablePayload } from '../types'

interface Props {
  onImport: (payload: TimetablePayload) => void
}

export function GuidePage({ onImport }: Props) {
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [target, setTarget] = useState(() => {
    const { origin, pathname } = window.location
    const base = pathname.replace(/\/index\.html$/, '').replace(/\/$/, '') || ''
    return `${origin}${base}/`
  })

  const href = useMemo(() => {
    const src = buildBookmarkletSource(target || BOOKMARKLET_TARGET_PLACEHOLDER)
    return minifyBookmarklet(src)
  }, [target])

  const doImport = (payload: TimetablePayload, tip: string) => {
    onImport(payload)
    setError(null)
    setOkMsg(tip)
    window.setTimeout(() => navigate('/'), 800)
  }

  const handlePasteImport = () => {
    try {
      const payload = parsePastedTimetable(text)
      doImport(payload, `已导入 ${payload.courses.length} 门课`)
    } catch (e) {
      setOkMsg(null)
      setError(e instanceof Error ? e.message : '导入失败')
    }
  }

  const handleDemo = () => {
    doImport(buildMockPayload(0), '已载入演示课表')
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(href)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = href
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-6 pt-5 animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-ink">导入课表</h1>
      <p className="mt-1 text-sm text-muted leading-relaxed">
        手机三步搞定：打开教务 → 复制课表 → 粘贴到这里。数据只存在你手机里。
      </p>

      <section className="mt-5 rounded-2xl border border-line bg-white/90 p-4 shadow-sm">
        <div className="text-xs font-semibold text-brand">推荐 · 手机复制粘贴</div>
        <h2 className="mt-1 font-semibold text-ink">把课表贴进来</h2>

        <ol className="mt-3 space-y-2 text-sm text-muted leading-relaxed">
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[0.7rem] font-bold text-white">
              1
            </span>
            <span>
              手机打开教务{' '}
              <span className="font-mono text-[0.7rem] text-ink">61.139.105.138</span>
              ，登录后进入课表页
            </span>
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[0.7rem] font-bold text-white">
              2
            </span>
            <span>长按课表文字 → 全选 → 复制（能复制多少算多少）</span>
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[0.7rem] font-bold text-white">
              3
            </span>
            <span>回到本页，粘贴到下面框里，点「开始导入」</span>
          </li>
        </ol>

        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setError(null)
          }}
          rows={8}
          placeholder={`在这里长按粘贴课表文字…\n\n示例格式：\n${PASTE_EXAMPLE}`}
          className="mt-4 w-full resize-y rounded-xl border border-line bg-surface px-3 py-3 text-sm leading-relaxed outline-none focus:border-brand"
        />

        {error && (
          <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-expired">
            {error}
          </p>
        )}
        {okMsg && (
          <p className="mt-2 rounded-xl border border-brand/30 bg-brand-soft px-3 py-2 text-sm text-brand-dark">
            {okMsg}
          </p>
        )}

        <button
          type="button"
          onClick={handlePasteImport}
          className="mt-3 w-full rounded-xl bg-brand px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-brand/20 active:scale-[0.99] transition"
        >
          开始导入
        </button>

        <button
          type="button"
          onClick={handleDemo}
          className="mt-2 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-ink"
        >
          先看演示课表（不用复制）
        </button>

        <p className="mt-3 text-[0.75rem] leading-relaxed text-muted">
          不同手机复制出来的格式可能不一样。若识别不准，可先看演示；把真实课表截图发给开发者后，识别会更准。
        </p>
      </section>

      <details className="mt-4 rounded-2xl border border-line bg-white/90 p-4 shadow-sm">
        <summary className="cursor-pointer text-sm font-semibold text-ink">
          高级：电脑书签一键导入（可选）
        </summary>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          只有电脑浏览器才方便。手机一般不用看这里。
        </p>
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="mt-3 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand"
          placeholder={BOOKMARKLET_TARGET_PLACEHOLDER}
        />
        <p className="mt-2 text-sm text-muted">
          按 Ctrl+Shift+B 显示书签栏，把绿色按钮拖进去；再到教务课表页点该书签。
        </p>
        <a
          href={href}
          onClick={(e) => e.preventDefault()}
          draggable
          className="mt-3 flex items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white"
          title="拖到书签栏"
        >
          川轻化·导入课表（拖到书签栏）
        </a>
        <button
          type="button"
          onClick={copyCode}
          className="mt-2 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium"
        >
          {copied ? '已复制' : '复制书签代码'}
        </button>
        <p className="mt-2 text-[0.75rem] text-amber-800">
          当前书签仍是模拟数据，点了会导入示例课表。
        </p>
      </details>

      <details className="mt-3 rounded-2xl border border-line bg-white/90 p-4 shadow-sm">
        <summary className="cursor-pointer text-sm font-semibold text-ink">
          给开发者：如何提供真实课表
        </summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted leading-relaxed">
          <li>打开教务课表页</li>
          <li>截图发给开发者（或复制表格 HTML）</li>
          <li>开发者据此优化识别 / 书签解析</li>
        </ol>
      </details>
    </div>
  )
}
