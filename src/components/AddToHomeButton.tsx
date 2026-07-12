import { useEffect, useMemo, useState } from 'react'
import { publicAppUrl } from '../lib/importDraft'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type BrowserKind =
  | 'standalone'
  | 'wechat'
  | 'qq'
  | 'baidu'
  | 'ios-safari'
  | 'ios-other'
  | 'android'
  | 'other'

function isStandalone(): boolean {
  try {
    if (window.matchMedia('(display-mode: standalone)').matches) return true
    const nav = window.navigator as Navigator & { standalone?: boolean }
    if (nav.standalone) return true
  } catch {
    /* ignore */
  }
  return false
}

function detectBrowser(): BrowserKind {
  if (isStandalone()) return 'standalone'
  const ua = navigator.userAgent || ''
  if (/MicroMessenger/i.test(ua)) return 'wechat'
  if (/QQ\//i.test(ua) && !/QQBrowser/i.test(ua)) return 'qq'
  if (/baidubrowser|baiduboxapp|Baidu/i.test(ua)) return 'baidu'
  const ios = /iPhone|iPad|iPod/i.test(ua)
  if (ios) {
    // 真·Safari：含 Safari 且不是各种套壳
    const safari =
      /Safari/i.test(ua) &&
      !/CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|baidubrowser|baiduboxapp|MicroMessenger|QQ\//i.test(
        ua,
      )
    return safari ? 'ios-safari' : 'ios-other'
  }
  if (/Android/i.test(ua)) return 'android'
  return 'other'
}

function stepsFor(kind: BrowserKind): string[] {
  switch (kind) {
    case 'standalone':
      return ['已在桌面打开，可直接使用。']
    case 'wechat':
    case 'qq':
      return [
        '先点右上角 ···',
        '选「在浏览器打开」或「Safari」',
        '再用浏览器菜单「添加到主屏幕」',
      ]
    case 'baidu':
      return [
        '百度里一般没有「添加到主屏幕」',
        '点下方「复制链接」',
        '用系统自带 Safari / 浏览器打开链接',
        '再按浏览器提示添加到桌面',
      ]
    case 'ios-safari':
      return [
        '点底部分享按钮（方框向上箭头）',
        '下滑找到「添加到主屏幕」',
        '点「添加」即可',
      ]
    case 'ios-other':
      return [
        '当前不是 Safari，可能没有添加桌面入口',
        '点下方「复制链接」',
        '粘贴到 Safari 打开',
        '再点底部分享 →「添加到主屏幕」',
      ]
    case 'android':
      return [
        '点下方绿色按钮，按系统提示安装',
        '若无弹窗：点浏览器菜单 ··· →「添加到主屏幕 / 安装应用」',
      ]
    default:
      return [
        '点浏览器菜单，找「添加到主屏幕」或「安装应用」',
        '找不到就复制链接，用系统浏览器打开后再添加',
      ]
  }
}

/** 设置页：添加到手机桌面 */
export function AddToHomeButton() {
  const kind = useMemo(() => detectBrowser(), [])
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  )
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(() => kind === 'standalone')
  const [copied, setCopied] = useState(false)
  const steps = stepsFor(done ? 'standalone' : kind)

  useEffect(() => {
    if (isStandalone()) {
      setDone(true)
      return
    }
    const onBip = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBip)
    return () => window.removeEventListener('beforeinstallprompt', onBip)
  }, [])

  const copyLink = async () => {
    const url = publicAppUrl()
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt('复制下面的链接，到 Safari / 系统浏览器打开：', url)
      return
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const onInstallClick = async () => {
    if (done) return
    // iOS / 百度 / 微信：不能自动安装，点按钮时强调看步骤
    if (kind === 'ios-safari' || kind === 'ios-other' || kind === 'baidu') {
      return
    }
    if (deferred) {
      setBusy(true)
      try {
        await deferred.prompt()
        const choice = await deferred.userChoice
        setDeferred(null)
        if (choice.outcome === 'accepted') setDone(true)
      } catch {
        /* 看下方步骤 */
      } finally {
        setBusy(false)
      }
    }
  }

  const showInstallBtn =
    !done &&
    (kind === 'android' || kind === 'other' || Boolean(deferred))

  return (
    <div className="mt-3">
      <ol className="space-y-1.5 rounded-xl bg-surface px-3 py-2.5 text-[0.8rem] leading-relaxed text-ink">
        {steps.map((s, i) => (
          <li key={s} className="flex gap-2">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand text-[0.65rem] font-bold text-white">
              {i + 1}
            </span>
            <span className="min-w-0 text-muted">{s}</span>
          </li>
        ))}
      </ol>

      {showInstallBtn && (
        <button
          type="button"
          disabled={busy}
          onClick={() => void onInstallClick()}
          className="mt-3 w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? '请稍候…' : deferred ? '一键添加到桌面' : '尝试添加（若无弹窗请看上方步骤）'}
        </button>
      )}

      {!done && (
        <button
          type="button"
          onClick={() => void copyLink()}
          className={`mt-2 w-full rounded-xl border border-line px-4 py-2.5 text-sm font-semibold ${
            kind === 'baidu' || kind === 'ios-other' || kind === 'wechat' || kind === 'qq'
              ? 'bg-brand text-white border-brand'
              : 'bg-surface text-ink'
          }`}
        >
          {copied ? '已复制链接' : '复制链接'}
        </button>
      )}

      {done && (
        <p className="mt-3 text-center text-sm font-medium text-brand-dark">
          已在桌面模式打开
        </p>
      )}
    </div>
  )
}
