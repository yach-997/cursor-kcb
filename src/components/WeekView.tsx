import { useEffect, useMemo, useState } from 'react'
import type { Course } from '../types'
import {
  SECTION_TIME_RANGES,
  WEEKDAY_LABELS,
  courseColor,
  maxSection,
  weekMatches,
} from '../lib/storage'

interface Props {
  courses: Course[]
  suggestedWeek?: number | null
}

function detectMaxWeek(courses: Course[]): number {
  let max = 16
  for (const c of courses) {
    const range = c.weeks.match(/(\d+)\s*[-~至]\s*(\d+)/)
    if (range) {
      max = Math.max(max, Number(range[1]), Number(range[2]))
      continue
    }
    const single = c.weeks.match(/(\d+)/)
    if (single) max = Math.max(max, Number(single[1]))
  }
  return Math.min(Math.max(max, 1), 30)
}

/** 节次 → 网格行号（1=表头） */
function sectionRow(sec: number): number {
  // 2-5: 第1-4节; 6: 午休; 7-10: 第5-8节; 11-13: 第9-11节
  if (sec <= 4) return 1 + sec
  return sec + 2
}

export function WeekView({ courses, suggestedWeek }: Props) {
  const maxWeek = useMemo(() => detectMaxWeek(courses), [courses])
  const periodCount = Math.min(Math.max(maxSection(courses), 8), 11)
  const defaultWeek = useMemo(() => {
    if (suggestedWeek && suggestedWeek >= 1 && suggestedWeek <= maxWeek) {
      return suggestedWeek
    }
    return 1
  }, [suggestedWeek, maxWeek])

  const [viewWeek, setViewWeek] = useState(defaultWeek)
  const today = ((new Date().getDay() + 6) % 7) + 1

  useEffect(() => {
    setViewWeek(defaultWeek)
  }, [defaultWeek, courses.length])

  const weekCourses = useMemo(
    () =>
      courses.filter(
        (c) =>
          weekMatches(c, viewWeek) &&
          c.startSection <= periodCount &&
          c.weekday >= 1 &&
          c.weekday <= 7,
      ),
    [courses, viewWeek, periodCount],
  )

  const dateLabels = useMemo(() => {
    const now = new Date()
    const day = now.getDay()
    const thisMonday = new Date(now)
    thisMonday.setDate(now.getDate() + (day === 0 ? -6 : 1 - day))
    const baseWeek =
      suggestedWeek && suggestedWeek >= 1 ? suggestedWeek : viewWeek
    const monday = new Date(thisMonday)
    monday.setDate(thisMonday.getDate() + (viewWeek - baseWeek) * 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return `${d.getMonth() + 1}/${d.getDate()}`
    })
  }, [viewWeek, suggestedWeek])

  const lastRow = sectionRow(periodCount)
  const lunchRow = 6
  const sections = Array.from({ length: periodCount }, (_, i) => i + 1)

  return (
    <div className="flex min-h-0 flex-1 flex-col animate-fade-in">
      <div className="flex gap-0.5 overflow-x-auto px-2 pb-1 pt-1 scrollbar-none">
        {Array.from({ length: maxWeek }, (_, i) => i + 1).map((w) => {
          const active = viewWeek === w
          return (
            <button
              key={w}
              type="button"
              onClick={() => setViewWeek(w)}
              className={`shrink-0 px-2.5 py-1.5 text-sm font-semibold transition ${
                active
                  ? 'border-b-2 border-brand text-brand'
                  : 'text-muted'
              }`}
            >
              {w}周
            </button>
          )
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-1.5 pb-2">
        <div
          className="mx-auto min-w-[22rem] rounded-xl border border-line/80 bg-white/55 shadow-sm backdrop-blur-[2px]"
          style={{
            display: 'grid',
            gridTemplateColumns: '2.55rem repeat(7, minmax(2.7rem, 1fr))',
            gridTemplateRows: `2.6rem repeat(${lastRow - 1}, minmax(2.85rem, auto))`,
          }}
        >
          {/* 左上角 */}
          <div
            className="sticky left-0 z-30 border-b border-r border-line/60 bg-[#f3f7f5]/95"
            style={{ gridColumn: 1, gridRow: 1 }}
          />

          {/* 星期头 */}
          {WEEKDAY_LABELS.map((label, i) => {
            const day = i + 1
            const isToday = day === today
            return (
              <div
                key={day}
                className="flex flex-col items-center justify-center border-b border-line/60"
                style={{ gridColumn: day + 1, gridRow: 1 }}
              >
                <span className="text-[0.58rem] text-muted">{dateLabels[i]}</span>
                <span
                  className={`mt-0.5 text-[0.72rem] font-bold ${
                    isToday
                      ? 'rounded-full bg-brand px-1.5 py-0.5 text-white'
                      : 'text-ink'
                  }`}
                >
                  {label}
                </span>
              </div>
            )
          })}

          {/* 午休行 */}
          <div
            className="sticky left-0 z-20 flex items-center justify-center border-b border-r border-line/50 bg-amber-50 text-[0.58rem] font-semibold text-amber-800"
            style={{ gridColumn: 1, gridRow: lunchRow }}
          >
            午休
          </div>
          {WEEKDAY_LABELS.map((_, i) => (
            <div
              key={`lunch-${i}`}
              className="border-b border-line/40 bg-amber-50/50"
              style={{ gridColumn: i + 2, gridRow: lunchRow }}
            />
          ))}

          {/* 节次标签 + 背景格 */}
          {sections.map((sec) => {
            const row = sectionRow(sec)
            const range = SECTION_TIME_RANGES[sec] || ''
            const [start, end] = range.split('-')
            return (
              <div key={`sec-wrap-${sec}`} className="contents">
                <div
                  className="sticky left-0 z-20 flex flex-col items-center justify-center border-b border-r border-line/50 bg-[#f3f7f5]/95 px-0.5"
                  style={{ gridColumn: 1, gridRow: row }}
                >
                  <span className="text-[0.72rem] font-bold text-ink">{sec}</span>
                  <span className="text-[0.48rem] leading-none text-muted">{start}</span>
                  <span className="text-[0.48rem] leading-none text-muted">{end}</span>
                </div>
                {WEEKDAY_LABELS.map((_, i) => (
                  <div
                    key={`bg-${sec}-${i}`}
                    className="border-b border-r border-line/35 bg-white/20"
                    style={{ gridColumn: i + 2, gridRow: row }}
                  />
                ))}
              </div>
            )
          })}

          {/* 课程块 */}
          {weekCourses.map((course) => {
            const endSec = Math.min(course.endSection, periodCount)
            const rowStart = sectionRow(course.startSection)
            const rowEnd = sectionRow(endSec) + 1
            const color = courseColor(course.name)
            return (
              <div
                key={course.id}
                className="z-10 m-[3px] overflow-hidden rounded-md px-1 py-1 text-white shadow-sm"
                style={{
                  gridColumn: course.weekday + 1,
                  gridRow: `${rowStart} / ${rowEnd}`,
                  background: `linear-gradient(160deg, ${color}f2, ${color}cc)`,
                }}
              >
                <div className="text-[0.62rem] font-bold leading-snug break-all">
                  {course.name}
                </div>
                <div className="mt-0.5 text-[0.52rem] leading-tight opacity-95 break-all">
                  {course.room}
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-2 text-center text-[0.65rem] text-muted">
          第 {viewWeek} 周 · 点上方周数切换 · 可左右滑动
        </p>
      </div>
    </div>
  )
}
