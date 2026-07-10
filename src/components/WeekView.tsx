import type { Course } from '../types'
import {
  SECTION_TIMES,
  SECTION_TIME_RANGES,
  WEEKDAY_LABELS,
  courseColor,
  maxSection,
  weekMatches,
} from '../lib/storage'

interface Props {
  courses: Course[]
  teachingWeek: number | null
  selectedWeekday: number
  onSelectWeekday: (d: number) => void
  /** 为 true 时只显示当前教学周有的课；默认 false 显示全部 */
  onlyCurrentWeek?: boolean
}

function parityLabel(p: Course['weekParity']) {
  if (p === 'odd') return '单周'
  if (p === 'even') return '双周'
  return ''
}

export function WeekView({
  courses,
  teachingWeek,
  selectedWeekday,
  onSelectWeekday,
  onlyCurrentWeek = false,
}: Props) {
  const sections = maxSection(courses)
  const today = ((new Date().getDay() + 6) % 7) + 1 // Mon=1

  const dayCourses = courses
    .filter((c) => c.weekday === selectedWeekday)
    .filter((c) => !onlyCurrentWeek || weekMatches(c, teachingWeek))
    .sort((a, b) => a.startSection - b.startSection || a.name.localeCompare(b.name, 'zh'))

  /** 按起始节次分组，同一节次多门课（不同周次）全部展示 */
  const byStart = new Map<number, Course[]>()
  for (const c of dayCourses) {
    const list = byStart.get(c.startSection) || []
    list.push(c)
    byStart.set(c.startSection, list)
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 animate-fade-in">
      <p className="px-4 text-[0.75rem] text-muted">
        左右点星期查看 · 本学期共 {courses.length} 条课次 · 当天 {dayCourses.length} 条
      </p>
      <div className="flex gap-1.5 overflow-x-auto px-3 py-3 scrollbar-none">
        {WEEKDAY_LABELS.map((label, i) => {
          const day = i + 1
          const active = day === selectedWeekday
          const isToday = day === today
          const count = courses.filter((c) => {
            if (c.weekday !== day) return false
            if (!onlyCurrentWeek) return true
            return weekMatches(c, teachingWeek)
          }).length
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectWeekday(day)}
              className={`flex min-w-[3.1rem] flex-col items-center rounded-2xl px-2.5 py-2 transition active:scale-95 ${
                active
                  ? 'bg-brand text-white shadow-md shadow-brand/25'
                  : 'bg-white/80 text-ink border border-line'
              }`}
            >
              <span className="text-[0.65rem] opacity-80">{isToday ? '今天' : '周'}</span>
              <span className="mt-0.5 font-display text-base font-bold leading-none">
                {label}
              </span>
              <span className={`mt-1 text-[0.6rem] ${active ? 'text-white/90' : 'text-muted'}`}>
                {count}节
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-2">
        <div className="rounded-2xl border border-line bg-white/90 shadow-sm overflow-hidden">
          {Array.from({ length: sections }, (_, i) => i + 1).map((sec) => {
            const group = byStart.get(sec)
            const covered = dayCourses.some(
              (c) => c.startSection < sec && c.endSection >= sec,
            )
            // 被上一门连堂覆盖、且本行没有新开课 → 跳过
            if (covered && !group) return null

            const span = group
              ? Math.max(...group.map((c) => Math.max(1, c.endSection - c.startSection + 1)))
              : 1

            return (
              <div
                key={sec}
                className="grid grid-cols-[3.2rem_1fr] border-b border-line/70 last:border-b-0"
                style={{ minHeight: `${Math.max(span, group?.length || 1) * 4.1}rem` }}
              >
                <div className="flex flex-col items-center justify-start border-r border-line/70 bg-surface/60 py-2 px-0.5">
                  <span className="text-xs font-semibold text-ink">{sec}</span>
                  <span className="mt-0.5 whitespace-pre-line text-center text-[0.55rem] leading-tight text-muted">
                    {(SECTION_TIME_RANGES[sec] || SECTION_TIMES[sec] || '').replace(
                      '-',
                      '\n',
                    )}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 p-1.5">
                  {group ? (
                    group.map((course) => (
                      <div
                        key={course.id}
                        className={`course-chip flex flex-col justify-center ${
                          course.weekParity === 'odd'
                            ? 'odd-week'
                            : course.weekParity === 'even'
                              ? 'even-week'
                              : ''
                        }`}
                        style={{
                          backgroundColor: courseColor(course.name),
                          minHeight: `${Math.max(1, course.endSection - course.startSection + 1) * 3.2}rem`,
                        }}
                      >
                        <div className="font-semibold text-[0.78rem] leading-snug">
                          {course.name}
                        </div>
                        <div className="mt-1 opacity-95">
                          {course.room}
                          {course.teacher ? ` · ${course.teacher}` : ''}
                        </div>
                        <div className="mt-0.5 flex flex-wrap gap-1 opacity-90">
                          <span>
                            第{course.startSection}
                            {course.endSection !== course.startSection
                              ? `-${course.endSection}`
                              : ''}
                            节
                          </span>
                          <span>· {course.weeks}周</span>
                          {parityLabel(course.weekParity) && (
                            <span className="rounded bg-black/20 px-1">
                              {parityLabel(course.weekParity)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full min-h-[3.5rem] rounded-lg border border-dashed border-transparent" />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {dayCourses.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">
            这一天没有课，点上面其他星期看看
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-3 px-1 text-[0.65rem] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-5 rounded course-chip odd-week bg-brand" />
            单周斜纹
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-5 rounded course-chip even-week bg-brand" />
            双周斜纹
          </span>
          <span>同一格多门课 = 不同周次</span>
        </div>
      </div>
    </div>
  )
}
