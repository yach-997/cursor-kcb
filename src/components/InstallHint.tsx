import { useEffect, useState } from 'react'

/** 永久不再提示 */
const HIDE_FOREVER_KEY = 'susuc-hide-install-hint-forever'
/** 旧版永久键 */
const LEGACY_HIDE_KEY = 'susuc-hide-install-hint'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

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

function fallbackInstallTip(): string {
  const ua = navigator.userAgent || ''
  if (/MicroMessenger|QQ\//i.test(ua) && !/QQBrowser/i.test(ua)) {
    return '请先点右上角 ··· → 在浏览器打开，再用浏览器菜单「添加到主屏幕」。'
  }
  if (/iPhone|iPad|iPod/i.test(ua)) {
    return '请点底部分享按钮，再选「添加到主屏幕」。'
  }
  return '请用浏览器菜单「添加到主屏幕 / 安装应用」。'
}

/** 首页底部：引导把课表助手加到桌面 */
export function InstallHint() {
  const [visible, setVisible] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  )
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(LEGACY_HIDE_KEY) === '1') {
        localStorage.removeItem(LEGACY_HIDE_KEY)
      }
      if (localStorage.getItem(HIDE_FOREVER_KEY) === '1') return
    } catch {
      /* ignore */
    }
    if (isStandalone()) return
    setVisible(true)

    const onBip = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBip)
    return () => window.removeEventListener('beforeinstallprompt', onBip)
  }, [])

  if (!visible) return null

  const dismissForever = () => {
    try {
      localStorage.setItem(HIDE_FOREVER_KEY, '1')
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  const install = async () => {
    if (deferred) {
      setBusy(true)
      try {
        await deferred.prompt()
        const choice = await deferred.userChoice
        setDeferred(null)
        if (choice.outcome === 'accepted') dismissForever()
      } catch {
        window.alert(fallbackInstallTip())
      } finally {
        setBusy(false)
      }
      return
    }
    window.alert(fallbackInstallTip())
  }

  return (
    <div className="mx-3 mb-3 rounded-2xl border border-brand/20 bg-brand-soft/90 px-3.5 py-3.5 shadow-sm">
      <p className="text-sm font-semibold text-brand-dark">添加到手机桌面</p>
      <p className="mt-1 text-[0.8rem] leading-relaxed text-muted">
        点击下方按钮一键添加到桌面
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void install()}
          className="rounded-xl bg-brand px-3 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand/20 disabled:opacity-60"
        >
          {busy ? '请稍候…' : '一键添加到桌面'}
        </button>
        <button
          type="button"
          onClick={dismissForever}
          className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-medium text-ink"
        >
          不再提示
        </button>
      </div>
    </div>
  )
}
