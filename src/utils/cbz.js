const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']

export function isCbzFile(file) {
  return file.name.toLowerCase().endsWith('.cbz')
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
  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(file)
  const imageEntries = sortByFilename(
    Object.values(zip.files).filter(entry => !entry.dir && isImageEntry(entry))
  )
  const urls = await Promise.all(
    imageEntries.map(async entry => {
      const blob = await entry.async('blob')
      return URL.createObjectURL(blob)
    })
  )
  return urls
}
