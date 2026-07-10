/**
 * 严谨校验：两份官方 PDF 解析结果必须满足硬性条件。
 * npx tsx scripts/validate-pdf-parse.ts
 */
import { readFileSync } from 'fs'
import { join } from 'path'
import { parseZfPdfItems, type PdfTextItem } from '../src/lib/parsePdf'
import type { Course } from '../src/types'

class NodeCMapReaderFactory {
  baseUrl: string
  isCompressed: boolean
  constructor({
    baseUrl,
    isCompressed = true,
  }: {
    baseUrl: string
    isCompressed?: boolean
  }) {
    this.baseUrl = baseUrl
    this.isCompressed = isCompressed
  }
  async fetch({ name }: { name: string }) {
    return {
      cMapData: new Uint8Array(
        readFileSync(join(this.baseUrl, name + (this.isCompressed ? '.bcmap' : ''))),
      ),
      compressionType: this.isCompressed ? 1 : 0,
    }
  }
}

async function loadItems(pdfPath: string): Promise<PdfTextItem[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(readFileSync(pdfPath)),
    useSystemFonts: true,
    cMapUrl: 'public/pdfjs/cmaps/',
    cMapPacked: true,
    CMapReaderFactory: NodeCMapReaderFactory,
    standardFontDataUrl: 'public/pdfjs/standard_fonts/',
  }).promise
  const items: PdfTextItem[] = []
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    const content = await page.getTextContent()
    for (const raw of content.items) {
      if (!('str' in raw) || !raw.str?.trim()) continue
      const t = raw as { str: string; transform: number[] }
      items.push({
        str: t.str,
        x: +t.transform[4].toFixed(1),
        y: +t.transform[5].toFixed(1),
        page: p,
      })
    }
  }
  return items
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error('ASSERT: ' + msg)
}

function validateMao(courses: Course[], items: PdfTextItem[]) {
  const markers = items.filter((i) =>
    /\(\d{1,2}\s*[-~～]\s*\d{1,2}\s*节\)/.test(i.str),
  )
  assert(markers.length === 17, `毛茂婷节次锚点应为 17，实际 ${markers.length}`)
  assert(courses.length >= 17, `毛茂婷课次过少: ${courses.length}`)

  const slots = new Set(
    courses.map((c) => `${c.weekday}-${c.startSection}-${c.endSection}`),
  )
  assert(slots.size === 17, `毛茂婷独立课位应为 17，实际 ${slots.size}`)

  for (const c of courses) {
    assert(c.name.length >= 2, `课名过短: ${c.name}`)
    assert(c.name !== '概论', `课名未补全: ${c.name}`)
    assert(!c.room.includes('未知'), `缺教室: ${c.name}`)
    assert(!c.teacher.includes('未知'), `缺教师: ${c.name}`)
    assert(c.weekday >= 1 && c.weekday <= 7, `星期非法: ${c.weekday}`)
    assert(c.startSection >= 1 && c.endSection <= 12, `节次非法`)
  }

  // 关键回归：周一 9-11 马克思主义
  const monMarx = courses.filter(
    (c) =>
      c.weekday === 1 &&
      c.startSection === 9 &&
      c.endSection === 11 &&
      c.name.includes('马克思主义政治经济学'),
  )
  assert(monMarx.length >= 1, '缺少周一 9-11 马克思主义政治经济学概论')

  const tueMarx = courses.filter(
    (c) =>
      c.weekday === 2 &&
      c.startSection === 9 &&
      c.endSection === 11 &&
      c.name.includes('马克思主义政治经济学'),
  )
  assert(tueMarx.length >= 1, '缺少周二 9-11 马克思主义政治经济学概论')
}

function validateChen(courses: Course[]) {
  assert(courses.length >= 25, `陈春升课次过少: ${courses.length}`)
  for (const c of courses) {
    assert(c.name.length >= 2, `课名过短: ${c.name}`)
    assert(c.weekday >= 1 && c.weekday <= 7, `星期非法`)
  }
  const hasLinux = courses.some((c) => c.name.includes('LINUX'))
  const hasPhy = courses.some((c) => c.name.includes('大学物理'))
  assert(hasLinux, '陈春升应含 LINUX 课程')
  assert(hasPhy, '陈春升应含重修大学物理（其他课程）')
}

const maoItems = await loadItems('tmp-mao.pdf')
const chenItems = await loadItems('tmp-chen.pdf')
const mao = parseZfPdfItems(maoItems)
const chen = parseZfPdfItems(chenItems)

validateMao(mao.courses, maoItems)
validateChen(chen.courses)

console.log('PASS 毛茂婷', mao.courses.length, '课次 /', mao.school)
console.log('PASS 陈春升', chen.courses.length, '课次 /', chen.school)
