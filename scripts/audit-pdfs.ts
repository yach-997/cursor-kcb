/**
 * 从 PDF 抽出所有「(N-M节)」锚点及邻域文本，便于人工/自动核对。
 */
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import type { PdfTextItem } from '../src/lib/parsePdf'
import { parseZfPdfItems } from '../src/lib/parsePdf'

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

function dump(label: string, items: PdfTextItem[]) {
  const lines: string[] = [`=== ${label} items=${items.length} ===`]
  const sorted = [...items].sort(
    (a, b) => a.page - b.page || b.y - a.y || a.x - b.x,
  )
  for (const it of sorted) {
    lines.push(
      `p${it.page} y${it.y.toFixed(1).padStart(6)} x${it.x.toFixed(1).padStart(6)} | ${JSON.stringify(it.str)}`,
    )
  }
  const secHits = items.filter((i) => /\(\d{1,2}\s*[-~～]\s*\d{1,2}\s*节\)/.test(i.str))
  lines.push(`\n--- section markers: ${secHits.length} ---`)
  for (const s of secHits.sort((a, b) => a.page - b.page || b.y - a.y || a.x - b.x)) {
    lines.push(`p${s.page} y${s.y} x${s.x} ${JSON.stringify(s.str)}`)
  }
  return lines.join('\n')
}

const mao = await loadItems('tmp-mao.pdf')
const chen = await loadItems('tmp-chen.pdf')
writeFileSync('tmp-mao-dump.txt', dump('MAO', mao), 'utf8')
writeFileSync('tmp-chen-dump.txt', dump('CHEN', chen), 'utf8')

const maoP = parseZfPdfItems(mao)
const chenP = parseZfPdfItems(chen)
console.log('MAO courses', maoP.courses.length, 'section markers', mao.filter(i=>/\(\d+[-~～]\d+节\)/.test(i.str)).length)
console.log('CHEN courses', chenP.courses.length)

const key = (c: { weekday: number; startSection: number; endSection: number; weeks: string; name: string; room: string }) =>
  `周${c.weekday}|${c.startSection}-${c.endSection}|${c.weeks}|${c.name}|${c.room}`

console.log('\nMAO all:')
for (const c of [...maoP.courses].sort((a,b)=>a.weekday-b.weekday||a.startSection-b.startSection||a.weeks.localeCompare(b.weeks))) {
  console.log(key(c), c.teacher)
}
