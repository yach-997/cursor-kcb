/**
 * 把 dist/index.html 里的本地 assets 改成 jsDelivr 绝对地址。
 * HTML 仍用 raw.githack（正确 text/html），JS/CSS 走 jsDelivr（国内更快）。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(process.cwd(), 'dist')
const htmlPath = resolve(root, 'index.html')
const cdn = 'https://testingcf.jsdelivr.net/gh/yach-997/susuc-kcb@cdn'

let html = readFileSync(htmlPath, 'utf8')
html = html.replace(/(href|src)="\.\/assets\//g, `$1="${cdn}/assets/`)
html = html.replace(
  /(href|src)="\.\/(favicon\.svg|apple-touch-icon\.png|manifest\.webmanifest)"/g,
  `$1="${cdn}/$2"`,
)
writeFileSync(htmlPath, html)
console.log('rewrote dist/index.html asset URLs ->', cdn)
