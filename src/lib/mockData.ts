import type { Course, TimetablePayload } from '../types'
import { parseWeekParity, uid } from './storage'

/** 模拟正方课表数据，便于本地联调；真实页面解析见 bookmarklet */
export const MOCK_COURSES: Omit<Course, 'id' | 'weekParity'>[] = [
  {
    name: '高等数学A',
    teacher: '张老师',
    room: '一教A301',
    weekday: 1,
    startSection: 1,
    endSection: 2,
    weeks: '1-16',
  },
  {
    name: '大学英语',
    teacher: '李老师',
    room: '外语楼203',
    weekday: 1,
    startSection: 3,
    endSection: 4,
    weeks: '1-16',
  },
  {
    name: '程序设计基础',
    teacher: '王老师',
    room: '实验楼B105',
    weekday: 2,
    startSection: 1,
    endSection: 2,
    weeks: '1-16',
  },
  {
    name: '线性代数',
    teacher: '赵老师',
    room: '一教B201',
    weekday: 2,
    startSection: 5,
    endSection: 6,
    weeks: '1-8单',
  },
  {
    name: '体育（篮球）',
    teacher: '陈老师',
    room: '体育馆',
    weekday: 3,
    startSection: 3,
    endSection: 4,
    weeks: '1-16',
  },
  {
    name: '中国近现代史纲要',
    teacher: '刘老师',
    room: '二教C102',
    weekday: 3,
    startSection: 7,
    endSection: 8,
    weeks: '2-16双',
  },
  {
    name: '大学物理',
    teacher: '周老师',
    room: '一教A405',
    weekday: 4,
    startSection: 1,
    endSection: 2,
    weeks: '1-16',
  },
  {
    name: '物理实验',
    teacher: '吴老师',
    room: '物理楼301',
    weekday: 4,
    startSection: 5,
    endSection: 6,
    weeks: '1-8',
  },
  {
    name: '形势与政策',
    teacher: '郑老师',
    room: '二教A101',
    weekday: 5,
    startSection: 1,
    endSection: 2,
    weeks: '1-8单',
  },
  {
    name: '创新创业基础',
    teacher: '孙老师',
    room: '三教D208',
    weekday: 5,
    startSection: 3,
    endSection: 4,
    weeks: '1-16',
  },
]

export function buildMockPayload(daysAgo = 0): TimetablePayload {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  // 演示：把「今天」落在第 3 周附近，方便看到今日课
  const monday = new Date()
  const day = monday.getDay()
  monday.setDate(monday.getDate() + (day === 0 ? -6 : 1 - day) - 14)
  const y = monday.getFullYear()
  const m = String(monday.getMonth() + 1).padStart(2, '0')
  const dd = String(monday.getDate()).padStart(2, '0')
  return {
    version: 1,
    school: '四川轻化工大学',
    updatedAt: d.toISOString(),
    termLabel: '2025-2026 下学期（演示）',
    termStart: `${y}-${m}-${dd}`,
    courses: MOCK_COURSES.map((c) => ({
      ...c,
      id: uid(),
      weekParity: parseWeekParity(c.weeks),
    })),
  }
}
