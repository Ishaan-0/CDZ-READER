const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.avif']

export function isCbzFile(file) {
  return file.name.toLowerCase().endsWith('.cbz')
}

export function isCbrFile(file) {
  return file.name.toLowerCase().endsWith('.cbr')
}

export function isComicFile(file) {
  return isCbzFile(file) || isCbrFile(file)
}

export function isImageEntry(entry) {
  const lower = entry.name.toLowerCase()
  return IMAGE_EXTENSIONS.some(ext => lower.endsWith(ext))
}

export function sortByFilename(entries) {
  return [...entries].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  )
}

export async function extractPages(file) {
  if (isCbrFile(file)) {
    const { extractCbrPages } = await import('./cbr.js')
    return extractCbrPages(file)
  }
  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(file)
  const imageEntries = sortByFilename(
    Object.values(zip.files).filter(entry => !entry.dir && isImageEntry(entry))
  )
  if (imageEntries.length === 0) {
    throw new Error('No image entries found in this CBZ file')
  }
  const urls = await Promise.all(
    imageEntries.map(async entry => {
      const blob = await entry.async('blob')
      return URL.createObjectURL(blob)
    })
  )
  return urls
}
