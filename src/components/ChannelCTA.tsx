const QQ_SERVICE = 'https://qm.qq.com/q/iy0gyxKnrq'
const QQ_GROUP = 'https://qm.qq.com/q/ZwGz3jrQis'

/** 底部轻量联系入口 */
export function ChannelCTA() {
  return (
    <div className="mx-3 mb-3 flex items-center justify-center gap-3 text-sm animate-slide-up">
      <a
        href={QQ_SERVICE}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-medium text-brand active:opacity-70"
      >
        <span className="text-[0.7rem] opacity-70">QQ</span>
        客服
      </a>
      <span className="h-3 w-px bg-line" aria-hidden />
      <a
        href={QQ_GROUP}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-medium text-brand active:opacity-70"
      >
        <span className="text-[0.7rem] opacity-70">QQ</span>
        维护群
      </a>
    </div>
  )
}
