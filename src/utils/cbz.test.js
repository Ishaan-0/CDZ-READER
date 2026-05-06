import { describe, it, expect } from 'vitest'
import { isCbzFile, isImageEntry, sortByFilename } from './cbz.js'

describe('isCbzFile', () => {
  it('returns true for .cbz files', () => {
    expect(isCbzFile({ name: 'comic.cbz' })).toBe(true)
  })
  it('is case-insensitive', () => {
    expect(isCbzFile({ name: 'COMIC.CBZ' })).toBe(true)
  })
  it('returns false for non-cbz files', () => {
    expect(isCbzFile({ name: 'comic.pdf' })).toBe(false)
    expect(isCbzFile({ name: 'image.jpg' })).toBe(false)
  })
})

describe('isImageEntry', () => {
  it('returns true for jpg, png, gif, webp, bmp, avif', () => {
    expect(isImageEntry({ name: 'page001.jpg' })).toBe(true)
    expect(isImageEntry({ name: 'page001.jpeg' })).toBe(true)
    expect(isImageEntry({ name: 'page001.png' })).toBe(true)
    expect(isImageEntry({ name: 'page001.gif' })).toBe(true)
    expect(isImageEntry({ name: 'page001.webp' })).toBe(true)
    expect(isImageEntry({ name: 'page001.bmp' })).toBe(true)
    expect(isImageEntry({ name: 'page001.avif' })).toBe(true)
  })
  it('returns false for xml, db, txt files', () => {
    expect(isImageEntry({ name: 'ComicInfo.xml' })).toBe(false)
    expect(isImageEntry({ name: 'Thumbs.db' })).toBe(false)
    expect(isImageEntry({ name: 'readme.txt' })).toBe(false)
  })
})

describe('sortByFilename', () => {
  it('sorts numerically so page10 comes after page9', () => {
    const entries = [
      { name: 'page010.jpg' },
      { name: 'page002.jpg' },
      { name: 'page001.jpg' },
    ]
    const sorted = sortByFilename(entries)
    expect(sorted.map(e => e.name)).toEqual([
      'page001.jpg',
      'page002.jpg',
      'page010.jpg',
    ])
  })
  it('does not mutate the original array', () => {
    const entries = [{ name: 'b.jpg' }, { name: 'a.jpg' }]
    sortByFilename(entries)
    expect(entries[0].name).toBe('b.jpg')
  })
})
