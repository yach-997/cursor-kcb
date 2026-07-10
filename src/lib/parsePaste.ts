import type { Course, TimetablePayload } from '../types'
import { parseWeekParity, uid } from './storage'

const WEEKDAY_MAP: Record<string, number> = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  日: 7,
  天: 7,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
}

function detectWeekday(text: string): number | null {
  const m =
    text.match(/周\s*([一二三四五六日天1-7])/) ||
    text.match(/星期\s*([一二三四五六日天1-7])/)
  if (!m) return null
  return WEEKDAY_MAP[m[1]] ?? null
}

function detectSections(text: string): { start: number; end: number } | null {
  const m =
    text.match(/第\s*(\d+)\s*[-~～到至]\s*(\d+)\s*节/) ||
    text.match(/(\d+)\s*[-~～到至]\s*(\d+)\s*节/) ||
    text.match(/第\s*(\d+)\s*节/)
  if (!m) return null
  const start = Number(m[1])
  const end = Number(m[2] || m[1])
  if (!start || start > 12) return null
  return { start, end: Math.min(end || start, 12) }
}

function detectWeeks(text: string): string {
  const m =
    text.match(/\{?\s*(\d+\s*[-~～至]\s*\d+\s*[单双]?周?)\s*\}?/) ||
    text.match(/(\d+\s*[-~～至]\s*\d+\s*[单双])/) ||
    text.match(/(\d+\s*[单双]周)/) ||
    text.match(/周次[:：]?\s*([^\s，,；;]+)/)
  if (m) return m[1].replace(/\s/g, '').replace(/周$/, '') || '1-16'
  if (/单周/.test(text)) return '1-16单'
  if (/双周/.test(text)) return '1-16双'
  return '1-16'
}

function looksLikeRoom(line: string): boolean {
  return /楼|室|馆|场|机房|实验室|[一二三四五六七八九十\d]教|A\d|B\d|C\d|D\d|教室/.test(
    line,
  )
}

function looksLikeTeacher(line: string): boolean {
  if (looksLikeRoom(line)) return false
  if (/第?\d|周|节|星期/.test(line)) return false
  return line.length >= 2 && line.length <= 8
}

/**
 * 把手机从教务复制的课表文字，尽量解析成课程列表。
 * 正方复制格式因端而异，这里用启发式；解析不准时可继续用演示数据 / 等真实 HTML。
 */
export function parsePastedTimetable(raw: string): TimetablePayload {
  const text = raw.replace(/\r/g, '').trim()
  if (!text) throw new Error('还没有粘贴内容')

  // 若粘贴的是本站导出的 JSON
  if (text.startsWith('{') && text.includes('"courses"')) {
    const data = JSON.parse(text) as TimetablePayload
    if (!Array.isArray(data.courses)) throw new Error('JSON 格式不对')
    return {
      version: 1,
      school: data.school || '四川轻化工大学',
      updatedAt: data.updatedAt || new Date().toISOString(),
      courses: data.courses.map((c) => ({
        ...c,
        id: c.id || uid(),
        weekParity: c.weekParity || parseWeekParity(c.weeks || ''),
      })),
      termLabel: data.termLabel,
      termStart: data.termStart,
    }
  }

  const courses: Course[] = []
  // 按空行或明显分隔切块；没有空行则按行滑动窗口
  const blocks = text
    .split(/\n\s*\n+/)
    .map((b) => b.trim())
    .filter(Boolean)

  const tryBlock = (block: string, fallbackWeekday: number | null) => {
    const lines = block
      .split(/\n+/)
      .map((l) => l.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
    if (!lines.length) return

    const joined = lines.join(' ')
    const weekday = detectWeekday(joined) ?? fallbackWeekday
    const sections = detectSections(joined)
    if (weekday == null || !sections) return

    let name = lines[0]
      .replace(/\(.*?\)/g, '')
      .replace(/（.*?）/g, '')
      .replace(/周[一二三四五六日天].*$/, '')
      .replace(/第?\d+.*节.*$/, '')
      .trim()
    if (!name || name.length > 40) name = lines[0].slice(0, 20)

    let teacher = ''
    let room = ''
    for (const line of lines.slice(1)) {
      if (looksLikeRoom(line) && !room) room = line
      else if (looksLikeTeacher(line) && !teacher) teacher = line
    }
    // 同行里夹带教室
    if (!room) {
      const rm = joined.match(
        /([\u4e00-\u9fa5A-Za-z0-9]*[楼室馆场教][\u4e00-\u9fa5A-Za-z0-9\-]*)/,
      )
      if (rm) room = rm[1]
    }

    const weeks = detectWeeks(joined)
    courses.push({
      id: uid(),
      name: name || '未命名课程',
      teacher: teacher || '未知教师',
      room: room || '未知教室',
      weekday,
      startSection: sections.start,
      endSection: sections.end,
      weeks,
      weekParity: parseWeekParity(weeks),
    })
  }

  if (blocks.length > 1) {
    for (const b of blocks) tryBlock(b, null)
  } else {
    // 单块：按「含课程名特征」的行分组，或按 weekday 切换
    const lines = text
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean)
    let currentWeekday: number | null = null
    let buf: string[] = []

    const flush = () => {
      if (!buf.length) return
      tryBlock(buf.join('\n'), currentWeekday)
      buf = []
    }

    for (const line of lines) {
      const wd = detectWeekday(line)
      if (wd != null && line.length <= 6) {
        flush()
        currentWeekday = wd
        continue
      }
      // 新的一节课起点：同时带节次信息时先冲刷
      if (buf.length && detectSections(line) && detectSections(buf.join(' '))) {
        flush()
      }
      buf.push(line)
      // 一块攒够信息就解析
      if (buf.length >= 2 && detectSections(buf.join(' ')) && (wd != null || currentWeekday != null)) {
        // keep collecting a bit more for teacher/room
        if (buf.length >= 4) flush()
      }
    }
    flush()
  }

  // 再兜底：整段用正则扫「课程名 + 周X + 第a-b节」
  if (courses.length === 0) {
    const re =
      /([^\n，,；;]{2,30}?)[\s\n]*(?:周|星期)\s*([一二三四五六日天1-7])[\s\S]{0,40}?第?\s*(\d+)\s*[-~～到至]?\s*(\d+)?\s*节/g
    let m: RegExpExecArray | null
    while ((m = re.exec(text))) {
      const weeks = detectWeeks(text.slice(Math.max(0, m.index - 10), m.index + m[0].length + 30))
      const start = Number(m[3])
      const end = Number(m[4] || m[3])
      courses.push({
        id: uid(),
        name: m[1].replace(/\(.*?\)|（.*?）/g, '').trim() || '未命名课程',
        teacher: '未知教师',
        room: '未知教室',
        weekday: WEEKDAY_MAP[m[2]] || 1,
        startSection: start,
        endSection: end,
        weeks,
        weekParity: parseWeekParity(weeks),
      })
    }
  }

  if (!courses.length) {
    throw new Error(
      '没识别出课程。请确认复制的是课表内容，或先点「先看演示课表」体验；真实教务格式适配后会更准。',
    )
  }

  // 去重
  const seen = new Set<string>()
  const unique = courses.filter((c) => {
    const key = `${c.name}|${c.weekday}|${c.startSection}|${c.endSection}|${c.weeks}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return {
    version: 1,
    school: '四川轻化工大学',
    updatedAt: new Date().toISOString(),
    courses: unique,
  }
}

/** 给用户看的粘贴示例 */
export const PASTE_EXAMPLE = `高等数学A
张老师
一教A301
周一 第1-2节 1-16周

大学英语
李老师
外语楼203
周一 第3-4节 1-16周

线性代数
赵老师
一教B201
周二 第5-6节 1-8单周`
