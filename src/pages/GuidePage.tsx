import { useMemo, useState } from 'react'
import {
  BOOKMARKLET_TARGET_PLACEHOLDER,
  buildBookmarkletSource,
  minifyBookmarklet,
} from '../lib/bookmarklet'

export function GuidePage() {
  const [copied, setCopied] = useState(false)
  const [target, setTarget] = useState(() => {
    // 默认指向当前部署地址
    const { origin, pathname } = window.location
    const base = pathname.replace(/\/index\.html$/, '').replace(/\/$/, '') || ''
    return `${origin}${base}/`
  })

  const href = useMemo(() => {
    const src = buildBookmarkletSource(target || BOOKMARKLET_TARGET_PLACEHOLDER)
    return minifyBookmarklet(src)
  }, [target])

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = href
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-6 pt-5 animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-ink">导入课表</h1>
      <p className="mt-1 text-sm text-muted leading-relaxed">
        我们会做一个特殊书签：你在教务课表页点一下它，课表就会自动带回本站。数据只存在你自己的手机/电脑里。
      </p>

      <ol className="mt-6 space-y-4">
        <li className="rounded-2xl border border-line bg-white/90 p-4 shadow-sm">
          <div className="text-xs font-semibold text-brand">步骤 1</div>
          <h2 className="mt-1 font-semibold text-ink">确认网站地址</h2>
          <p className="mt-1 text-sm text-muted leading-relaxed">
            下面一般已经自动填好了，不用改。只有你换了域名才需要改。
          </p>
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="mt-3 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand"
            placeholder={BOOKMARKLET_TARGET_PLACEHOLDER}
          />
        </li>

        <li className="rounded-2xl border border-line bg-white/90 p-4 shadow-sm">
          <div className="text-xs font-semibold text-brand">步骤 2</div>
          <h2 className="mt-1 font-semibold text-ink">把「导入工具」存成书签</h2>
          <p className="mt-1 text-sm text-muted leading-relaxed">
            这一步不是打开链接，而是把下面的工具存进浏览器书签栏。电脑最简单，手机稍麻烦一点。
          </p>

          <div className="mt-3 rounded-xl bg-brand-soft px-3 py-2.5 text-sm text-brand-dark leading-relaxed">
            <p className="font-semibold">电脑（推荐，Chrome / Edge）</p>
            <ol className="mt-1 list-decimal space-y-1 pl-5">
              <li>
                先显示书签栏：按 <span className="font-mono text-[0.7rem]">Ctrl + Shift + B</span>
                ，让浏览器顶部出现一排书签
              </li>
              <li>用鼠标按住下面的绿色按钮不放</li>
              <li>拖到顶部书签栏，松手</li>
              <li>看到多了一个叫「川轻化·导入课表」的书签，就成功了</li>
            </ol>
          </div>

          <a
            href={href}
            onClick={(e) => e.preventDefault()}
            draggable
            className="mt-3 flex items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-md shadow-brand/20"
            title="按住拖到书签栏"
          >
            川轻化·导入课表（拖我到书签栏）
          </a>

          <div className="mt-4 rounded-xl bg-surface px-3 py-2.5 text-sm text-muted leading-relaxed">
            <p className="font-semibold text-ink">手机（Chrome 举例）</p>
            <ol className="mt-1 list-decimal space-y-1 pl-5">
              <li>先点下面灰色按钮，复制代码（按钮会变成「已复制」）</li>
              <li>点浏览器右上角「☆」或「⋮ → 添加书签」，随便收藏当前页面</li>
              <li>打开书签列表，找到刚收藏的那条，点编辑</li>
              <li>名称改成：川轻化·导入课表</li>
              <li>
                网址那一栏：把原来的内容全部删掉，长按粘贴刚才复制的代码（很长，以
                javascript: 开头）
              </li>
              <li>保存。以后在教务课表页点这个书签即可</li>
            </ol>
            <p className="mt-2 text-[0.75rem] text-muted">
              若手机保存失败或粘贴不进去，请用电脑按上面方法做，再登录同一浏览器账号同步书签。
            </p>
          </div>

          <button
            type="button"
            onClick={copyCode}
            className="mt-3 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink"
          >
            {copied ? '已复制，去粘贴到书签网址栏' : '复制书签代码（手机用）'}
          </button>
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-muted">查看代码预览（一般不用看）</summary>
            <pre className="mt-2 max-h-40 overflow-auto rounded-xl bg-ink p-3 text-[0.65rem] leading-relaxed text-green-200 break-all whitespace-pre-wrap">
              {href.slice(0, 500)}…
            </pre>
          </details>
        </li>

        <li className="rounded-2xl border border-line bg-white/90 p-4 shadow-sm">
          <div className="text-xs font-semibold text-brand">步骤 3</div>
          <h2 className="mt-1 font-semibold text-ink">去教务课表页点一下书签</h2>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-muted leading-relaxed">
            <li>
              打开教务系统并登录：
              <span className="font-mono text-[0.7rem]">61.139.105.138</span>
            </li>
            <li>进入「个人课表」或「学期理论课表」，看到大表格</li>
            <li>点刚才保存的书签「川轻化·导入课表」</li>
            <li>浏览器会自动跳回本站，并写入课表</li>
          </ol>
          <p className="mt-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 leading-relaxed">
            注意：现在还是<strong>模拟数据</strong>，点书签会导入示例课表，用来测试流程。等你发来真实课表截图/HTML 后，才会改成导入你的真课。
          </p>
        </li>
      </ol>

      <section className="mt-5 rounded-2xl border border-line bg-white/90 p-4 shadow-sm">
        <div className="text-xs font-semibold text-brand">给开发者 / 升级真实解析</div>
        <h2 className="mt-1 font-semibold text-ink">如何截取真实课表页</h2>
        <p className="mt-1 text-sm text-muted leading-relaxed">
          当前书签还是模拟数据。把真实课表发给开发者后，才能改成真正从正方页面提取课程。
        </p>

        <h3 className="mt-4 text-sm font-semibold text-ink">1. 打开课表</h3>
        <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-muted leading-relaxed">
          <li>
            浏览器打开教务：
            <span className="font-mono text-[0.7rem]">61.139.105.138</span>
          </li>
          <li>登录后进入「个人课表」或「学期理论课表」</li>
          <li>确保能看到周一到周日、按节次排列的大表格</li>
        </ol>

        <h3 className="mt-4 text-sm font-semibold text-ink">2. 截图（二选一）</h3>
        <div className="mt-2 space-y-3 text-sm text-muted leading-relaxed">
          <div className="rounded-xl bg-surface px-3 py-2.5">
            <p className="font-medium text-ink">方法 A：整页截图（推荐，Chrome / Edge）</p>
            <ol className="mt-1 list-decimal space-y-1 pl-5">
              <li>按 F12 打开开发者工具</li>
              <li>按 Ctrl + Shift + P，输入 screenshot</li>
              <li>选 Capture full size screenshot（截取全尺寸屏幕截图）</li>
              <li>把下载的长图发给开发者</li>
            </ol>
          </div>
          <div className="rounded-xl bg-surface px-3 py-2.5">
            <p className="font-medium text-ink">方法 B：普通截图</p>
            <ol className="mt-1 list-decimal space-y-1 pl-5">
              <li>按 Win + Shift + S</li>
              <li>框选整张课表表格</li>
              <li>粘贴到微信 / QQ 发给开发者，或先保存成图片</li>
            </ol>
          </div>
        </div>

        <h3 className="mt-4 text-sm font-semibold text-ink">3. 复制 HTML（更准，可选但强烈建议）</h3>
        <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-muted leading-relaxed">
          <li>在课表表格上右键 → 检查</li>
          <li>左侧高亮到 &lt;table&gt; 或带 kbgrid 的区域</li>
          <li>右键 → Copy → Copy element（复制元素）</li>
          <li>粘贴到记事本，保存为「课表.html」发给开发者</li>
        </ol>

        <p className="mt-3 text-sm text-muted leading-relaxed">
          至少发 2～3 张清晰截图也可以先改一版；有 HTML 解析会更准。请注明是本学期个人课表，尽量让单双周、连堂课也出现在画面里。
        </p>
      </section>

      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        提示：部分手机浏览器会拦截过长的 javascript: 书签。若无法保存，请用电脑 Chrome
        生成书签后同步，或使用「设置 → 载入演示数据」先体验界面。
      </div>
    </div>
  )
}
