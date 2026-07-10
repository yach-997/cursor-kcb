/** 带超时的 Promise */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms)
    promise.then(
      (value) => {
        window.clearTimeout(timer)
        resolve(value)
      },
      (err) => {
        window.clearTimeout(timer)
        reject(err)
      },
    )
  })
}

export async function fetchBytesWithTimeout(
  url: string,
  ms = 5000,
): Promise<Uint8Array> {
  const ac = new AbortController()
  const timer = window.setTimeout(() => ac.abort(), ms)
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      cache: 'force-cache',
      mode: 'cors',
    })
    if (!res.ok) throw new Error(`${url} → ${res.status}`)
    return new Uint8Array(await res.arrayBuffer())
  } finally {
    window.clearTimeout(timer)
  }
}

const PDFJS_VER = '4.10.38'

export function assetRoot(): string {
  const origin = window.location.origin
  const base = import.meta.env.BASE_URL || '/'
  return new URL(base, origin).href.replace(/\/?$/, '/')
}

/** pdf.js 4.x：CMap 多源加载（本地优先） */
export function createLocalCMapReaderFactory() {
  const local = new URL('pdfjs/cmaps/', assetRoot()).href
  const mirror = `https://registry.npmmirror.com/pdfjs-dist/${PDFJS_VER}/files/cmaps/`

  return class LocalCMapReaderFactory {
    baseUrl = local
    isCompressed = true

    constructor(_opts?: { baseUrl?: string | null; isCompressed?: boolean }) {}

    async fetch({ name }: { name: string }) {
      const file = `${name}.bcmap`
      try {
        const cMapData = await fetchBytesWithTimeout(`${local}${file}`, 6000)
        return { cMapData, isCompressed: true }
      } catch {
        const cMapData = await fetchBytesWithTimeout(`${mirror}${file}`, 6000)
        return { cMapData, isCompressed: true }
      }
    }
  }
}

/** pdf.js 4.x：标准字体多源加载 */
export function createLocalStandardFontDataFactory() {
  const local = new URL('pdfjs/standard_fonts/', assetRoot()).href
  const mirror = `https://registry.npmmirror.com/pdfjs-dist/${PDFJS_VER}/files/standard_fonts/`

  return class LocalStandardFontDataFactory {
    baseUrl = local

    constructor(_opts?: { baseUrl?: string | null }) {}

    async fetch({ filename }: { filename: string }) {
      try {
        return await fetchBytesWithTimeout(`${local}${filename}`, 6000)
      } catch {
        return await fetchBytesWithTimeout(`${mirror}${filename}`, 6000)
      }
    }
  }
}

export function looksLikeTimetableText(items: { str: string }[]): boolean {
  if (items.length < 8) return false
  const text = items.map((i) => i.str).join('')
  if (/周数\s*[:：]|课表|星期[一二三四五六日天]/.test(text)) return true
  if (/\(\d{1,2}\s*[-~～]\s*\d{1,2}\s*节\)/.test(text)) return true
  const hans = (text.match(/[\u4e00-\u9fff]/g) || []).length
  return hans >= 20
}

export function prefetchCriticalCmaps(): void {
  const base = new URL('pdfjs/cmaps/', assetRoot()).href
  for (const name of [
    'Adobe-GB1-UCS2',
    'GBK-EUC-H',
    'GB-EUC-H',
    'UniGB-UCS2-H',
    'GB-H',
  ]) {
    void fetch(`${base}${name}.bcmap`, { cache: 'force-cache' }).catch(() => {})
  }
}

export function formatPdfError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err || '未知错误')
  if (/async iterable|asyncIterator|ReadableStream/i.test(msg)) {
    return `当前手机浏览器不支持该 PDF 引擎特性：${msg}。请完全关闭后重开本页再试。`
  }
  if (/超时|timeout|abort/i.test(msg)) {
    return `识别超时：${msg}。请再选一次 PDF 重试。`
  }
  if (/CMap|cmap|font|fetch|Failed to fetch|网络/i.test(msg)) {
    return `课表字体资源加载失败：${msg}。请确认网络正常后重试。`
  }
  if (/worker|WorkerMessageHandler|fake worker/i.test(msg)) {
    return `PDF 引擎初始化失败：${msg}。请完全关闭页面后重开再试。`
  }
  return `PDF 解析失败：${msg}`
}
