import unrarWasmUrl from 'node-unrar-js/esm/js/unrar.wasm?url'
import { isImageEntry, sortByFilename } from './cbz.js'

function mimeType(filename) {
  const ext = filename.toLowerCase().split('.').pop()
  return (
    { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp', avif: 'image/avif' }[ext] ??
    'application/octet-stream'
  )
}

export async function extractCbrPages(file) {
  const { createExtractorFromData } = await import('node-unrar-js')

  const [data, wasmBinary] = await Promise.all([
    file.arrayBuffer(),
    fetch(unrarWasmUrl).then(r => r.arrayBuffer()),
  ])

  const extractor = await createExtractorFromData({ data, wasmBinary })

  const list = extractor.getFileList()
  const imageHeaders = sortByFilename(
    [...list.fileHeaders].filter(h => !h.flags.directory && isImageEntry({ name: h.name }))
  )

  if (imageHeaders.length === 0) {
    throw new Error('No image entries found in this CBR file')
  }

  const imageNames = imageHeaders.map(h => h.name)
  const extracted = extractor.extract({ files: imageNames })

  const dataMap = new Map()
  for (const { fileHeader, extraction } of extracted.files) {
    if (extraction) dataMap.set(fileHeader.name, extraction)
  }

  return imageHeaders
    .filter(h => dataMap.has(h.name))
    .map(h => URL.createObjectURL(new Blob([dataMap.get(h.name)], { type: mimeType(h.name) })))
}
