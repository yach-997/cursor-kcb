const QQ_PERSONAL = 'https://qm.qq.com/q/iy0gyxKnrq'
const QQ_GROUP = 'https://qm.qq.com/q/ZwGz3jrQis'

/** 紧凑双入口：个人 QQ / 维护群 */
export function ChannelCTA() {
  return (
    <div className="mx-3 mb-2 grid grid-cols-2 gap-2 animate-slide-up">
      <a
        href={QQ_PERSONAL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 rounded-xl border border-brand/25 bg-white/90 px-3 py-2.5 text-sm font-semibold text-brand-dark shadow-sm active:scale-[0.98] transition"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand text-[0.65rem] font-bold text-white">
          QQ
        </span>
        QQ维护
      </a>
      <a
        href={QQ_GROUP}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 rounded-xl border border-brand/25 bg-brand px-3 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand/15 active:scale-[0.98] transition"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/20 text-[0.65rem] font-bold">
          群
        </span>
        QQ维护群
      </a>
    </div>
  )
}
