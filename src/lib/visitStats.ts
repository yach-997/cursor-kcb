/** 累计访问展示：基础数 + 按日不规律虚增 + 真实 PV（不蒜子） */

export const VISIT_BASE = 1450

/** 功能上线日（按本地日历，当天起算第 0 天不加虚增） */
export const VISIT_FAKE_START = '2026-07-12'

/** 每日虚增序列，循环使用 */
export const VISIT_FAKE_PATTERN = [10, 15, 8, 20] as const

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function parseLocalDate(iso: string): Date {
  const [y, m, day] = iso.split('-').map(Number)
  return new Date(y, m - 1, day)
}

/** 自起始日到今天，已过去的整天数（今天尚未结束，虚增算到昨天） */
export function daysElapsedSinceStart(
  startIso: string = VISIT_FAKE_START,
  now: Date = new Date(),
): number {
  const start = startOfLocalDay(parseLocalDate(startIso))
  const today = startOfLocalDay(now)
  const diff = Math.floor((today.getTime() - start.getTime()) / 86_400_000)
  return Math.max(0, diff)
}

/** 不规律虚增累计（不含基础数、不含真实访问） */
export function fakeVisitGrowth(
  days: number = daysElapsedSinceStart(),
): number {
  let sum = 0
  const n = VISIT_FAKE_PATTERN.length
  for (let i = 0; i < days; i++) {
    sum += VISIT_FAKE_PATTERN[i % n]!
  }
  return sum
}

export function formatVisitCount(n: number): string {
  return n.toLocaleString('zh-CN')
}
