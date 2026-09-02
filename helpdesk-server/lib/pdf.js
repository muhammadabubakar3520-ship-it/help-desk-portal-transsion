// Minimal, dependency-free PDF generator. In keeping with the rest of this
// backend (stock Node.js, no third-party packages), this hand-writes just
// enough of the PDF spec - objects, a content stream per page, and an xref
// table - to lay out lines of text (using the built-in Helvetica font)
// across as many Letter-sized pages as needed. Good enough for the admin
// data export; swap in a real PDF library later if richer layout is ever
// needed.

const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const MARGIN = 40
const LINE_HEIGHT = 14
const DEFAULT_SIZE = 10
const USABLE_HEIGHT = PAGE_HEIGHT - MARGIN * 2

function escapePdfText(str) {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    // Strip characters outside the printable Latin-1 range - the
    // standard PDF fonts can't render them and it keeps our byte-offset
    // math (which assumes 1 byte per char) correct.
    .replace(/[^\x20-\x7e]/g, '?')
}

// Lays a flat list of `{ text, size, gapBefore }` lines out top-to-bottom,
// automatically starting a new page whenever the current one is full, and
// returns a Buffer containing the finished PDF.
export function buildPdf(lines) {
  const pages = []
  let current = []
  let yUsed = 0 // vertical space consumed on the current page, in points

  for (const line of lines) {
    const size = line.size || DEFAULT_SIZE
    const gap = (line.gapBefore || 0) * LINE_HEIGHT
    const rowHeight = Math.max(LINE_HEIGHT, size * 1.4)

    if (yUsed + gap + rowHeight > USABLE_HEIGHT && current.length) {
      pages.push(current)
      current = []
      yUsed = 0
    } else {
      yUsed += gap
    }

    current.push(line)
    yUsed += rowHeight
  }
  if (current.length || pages.length === 0) pages.push(current)

  const numPages = pages.length
  const fontObjNum = 3
  const totalObjects = 3 + numPages * 2 // catalog, pages, font, then content+page per page

  const objStrings = new Array(totalObjects + 1)

  objStrings[1] = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`

  const kids = []
  for (let i = 0; i < numPages; i++) kids.push(`${5 + i * 2} 0 R`)
  objStrings[2] = `2 0 obj\n<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${numPages} >>\nendobj\n`

  objStrings[3] = `3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`

  for (let i = 0; i < numPages; i++) {
    const contentObjNum = 4 + i * 2
    const pageObjNum = 5 + i * 2

    let y = PAGE_HEIGHT - MARGIN
    let ops = 'BT\n'
    for (const line of pages[i]) {
      y -= (line.gapBefore || 0) * LINE_HEIGHT
      const size = line.size || DEFAULT_SIZE
      const rowHeight = Math.max(LINE_HEIGHT, size * 1.4)
      ops += `/F1 ${size} Tf\n1 0 0 1 ${MARGIN} ${y.toFixed(2)} Tm\n(${escapePdfText(line.text)}) Tj\n`
      y -= rowHeight
    }
    // Page-number footer, centered along the bottom margin, so multi-page
    // reports stay easy to keep in order once printed or shared as pages.
    if (numPages > 1) {
      const footerText = `Page ${i + 1} of ${numPages}`
      const footerX = PAGE_WIDTH / 2 - footerText.length * 2
      ops += `/F1 8 Tf\n1 0 0 1 ${footerX.toFixed(2)} ${(MARGIN / 2).toFixed(2)} Tm\n(${escapePdfText(footerText)}) Tj\n`
    }
    ops += 'ET'

    const streamBytes = Buffer.byteLength(ops, 'latin1')
    objStrings[contentObjNum] =
      `${contentObjNum} 0 obj\n<< /Length ${streamBytes} >>\nstream\n${ops}\nendstream\nendobj\n`
    objStrings[pageObjNum] =
      `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
      `/Resources << /Font << /F1 ${fontObjNum} 0 R >> >> /Contents ${contentObjNum} 0 R >>\nendobj\n`
  }

  const parts = []
  const offsets = new Array(totalObjects + 1)
  let pos = 0
  function push(str) {
    parts.push(str)
    pos += Buffer.byteLength(str, 'latin1')
  }

  push('%PDF-1.4\n')
  for (let n = 1; n <= totalObjects; n++) {
    offsets[n] = pos
    push(objStrings[n])
  }

  const xrefStart = pos
  let xref = `xref\n0 ${totalObjects + 1}\n0000000000 65535 f \n`
  for (let n = 1; n <= totalObjects; n++) {
    xref += `${String(offsets[n]).padStart(10, '0')} 00000 n \n`
  }
  push(xref)
  push(`trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`)

  return Buffer.from(parts.join(''), 'latin1')
}

// Convenience helpers for building a report: a title/heading line and a
// simple left-aligned table (fixed-width columns padded with spaces).
export function heading(text, size = 14) {
  return { text, size, gapBefore: 1 }
}

export function textLine(text, size = 10, gapBefore = 0) {
  return { text, size, gapBefore }
}

export function table(headers, rows, widths) {
  const padCell = (value, width) => {
    const str = String(value ?? '')
    return str.length >= width ? str.slice(0, width - 1) + ' ' : str.padEnd(width, ' ')
  }
  const lines = []
  lines.push(textLine(headers.map((h, i) => padCell(h, widths[i])).join(''), 9, 1))
  lines.push(textLine('-'.repeat(widths.reduce((a, b) => a + b, 0)), 9))
  for (const row of rows) {
    lines.push(textLine(row.map((cell, i) => padCell(cell, widths[i])).join(''), 9))
  }
  return lines
}
