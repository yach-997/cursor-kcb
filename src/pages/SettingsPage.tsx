import { useState } from 'react'
import { buildMockPayload } from '../lib/mockData'
import { forceRefreshApp } from '../lib/forceRefresh'
import {
  DEFAULT_CHANNEL_URL,
  clearTimetable,
  getChannelUrl,
  setChannelUrl,
} from '../lib/storage'
import type { TimetablePayload } from '../types'

interface Props {
  data: TimetablePayload | null
  onImport: (payload: TimetablePayload) => void
  onClear: () => void
}

export function SettingsPage({ data, onImport, onClear }: Props) {
  const [channel, setChannel] = useState(getChannelUrl)
  const [msg, setMsg] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const flash = (text: string) => {
    setMsg(text)
    window.setTimeout(() => setMsg(null), 2000)
  }

  const loadDemo = (daysAgo: number) => {
    onImport(buildMockPayload(daysAgo))
    flash(daysAgo === 0 ? '已载入演示课表' : `已载入 ${daysAgo} 天前的演示数据`)
  }

  const handleForceRefresh = async () => {
    setRefreshing(true)
    flash('正在清理缓存并刷新…')
    await forceRefreshApp()
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-6 pt-5 animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-ink">设置</h1>
      <p className="mt-1 text-sm text-muted">
        数据只存在本机。页面不对、导入报错，先点「强制刷新」。
      </p>

      {msg && (
        <div className="mt-3 rounded-xl border border-brand/30 bg-brand-soft px-3 py-2 text-sm text-brand-dark">
          {msg}
        </div>
      )}

      <section className="mt-5 rounded-2xl border-2 border-brand/30 bg-brand-soft/60 p-4 shadow-sm">
        <div className="text-xs font-semibold text-brand">最常用</div>
        <h2 className="mt-1 font-semibold text-ink">强制刷新到最新版</h2>
        <p className="mt-1 text-sm text-muted leading-relaxed">
          网站更新后，手机有时还显示旧页面。点一下这个按钮就行，不用自己清缓存。
        </p>
        <button
          type="button"
          disabled={refreshing}
          onClick={handleForceRefresh}
          className="mt-3 w-full rounded-xl bg-brand px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-brand/20 disabled:opacity-60"
        >
          {refreshing ? '正在刷新，请稍等…' : '强制刷新到最新版'}
        </button>
      </section>

      <section className="mt-4 rounded-2xl border border-line bg-white/90 p-4 shadow-sm">
        <h2 className="font-semibold text-ink">课表数据</h2>
        <p className="mt-1 text-sm text-muted">
          {data
            ? `${data.courses.length} 门课 · 更新于 ${new Date(data.updatedAt).toLocaleString('zh-CN')}`
            : '暂无数据'}
        </p>
        <div className="mt-3 grid gap-2">
          <button
            type="button"
            onClick={() => loadDemo(0)}
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white"
          >
            载入演示课表（今天）
          </button>
          <button
            type="button"
            onClick={() => loadDemo(10)}
            className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium"
          >
            载入过期演示（10天前，测弹窗）
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm('确定清除本地课表？')) {
                clearTimetable()
                onClear()
                flash('已清除')
              }
            }}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-expired"
          >
            清除本地课表
          </button>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-line bg-white/90 p-4 shadow-sm">
        <h2 className="font-semibold text-ink">调课通知频道</h2>
        <p className="mt-1 text-sm text-muted">底部引流按钮将打开此链接（可改成 QQ/微信/Telegram 等）。</p>
        <input
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="mt-3 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand"
          placeholder={DEFAULT_CHANNEL_URL}
        />
        <button
          type="button"
          onClick={() => {
            setChannelUrl(channel.trim() || DEFAULT_CHANNEL_URL)
            flash('频道链接已保存')
          }}
          className="mt-2 w-full rounded-xl bg-brand-soft px-4 py-2.5 text-sm font-semibold text-brand-dark"
        >
          保存链接
        </button>
      </section>

      <section className="mt-4 rounded-2xl border border-line bg-white/90 p-4 shadow-sm text-sm text-muted leading-relaxed">
        <h2 className="font-semibold text-ink">关于</h2>
        <p className="mt-2">四川轻化工大学课表助手 · 纯前端 PWA</p>
        <p className="mt-1">正方教务：61.139.105.138</p>
        <p className="mt-1">版本 1.0.1</p>
      </section>
    </div>
  )
}
