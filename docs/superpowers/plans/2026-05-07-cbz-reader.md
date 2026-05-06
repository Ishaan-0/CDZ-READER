# CBZ Reader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a client-side React SPA that lets a user upload a `.cbz` file and read it page by page in the browser.

**Architecture:** Single-page app with two views (Upload / Reader) controlled by a state flag in `App`. CBZ files are extracted in-browser with JSZip — images become object URLs held in memory, revoked on close. No backend, no router.

**Tech Stack:** React 18, Vite 6, Tailwind CSS 3, JSZip 3, Vitest 2

---

## File Map

| File | Responsibility |
|---|---|
| `index.html` | HTML entry point |
| `package.json` | Dependencies and scripts |
| `vite.config.js` | Vite + Vitest config |
| `tailwind.config.js` | Tailwind content paths |
| `postcss.config.js` | PostCSS plugins |
| `src/main.jsx` | React DOM mount |
| `src/index.css` | Tailwind directives |
| `src/App.jsx` | Global state: `pages`, `currentIndex`, `view` |
| `src/utils/cbz.js` | `isCbzFile`, `isImageEntry`, `sortByFilename`, `extractPages` |
| `src/utils/cbz.test.js` | Unit tests for cbz.js utilities |
| `src/UploadZone.jsx` | Drop zone UI, calls `extractPages`, passes URLs to App |
| `src/useKeyboard.js` | `useKeyboard({ onPrev, onNext })` hook |
| `src/Reader.jsx` | Full-screen reader: image, nav buttons, tap zones, page counter |

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/index.css`
- Create: `src/main.jsx`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "cbz-reader",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "jszip": "^3.10.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "vite": "^6.0.0",
    "vitest": "^2.1.5"
  }
}
```

- [ ] **Step 2: Create `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 3: Create `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

- [ ] **Step 4: Create `postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 5: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CBZ Reader</title>
  </head>
  <body class="m-0 p-0">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 7: Create `src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 8: Install dependencies**

Run from `CDZ READER/`:
```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 9: Commit**

```bash
git init
git add package.json vite.config.js tailwind.config.js postcss.config.js index.html src/index.css src/main.jsx
git commit -m "chore: scaffold Vite + React + Tailwind + JSZip project"
```

---

## Task 2: CBZ Utility Functions (TDD)

**Files:**
- Create: `src/utils/cbz.js`
- Create: `src/utils/cbz.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/utils/cbz.test.js`:

```js
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
  it('returns true for jpg, png, gif, webp, bmp', () => {
    expect(isImageEntry({ name: 'page001.jpg' })).toBe(true)
    expect(isImageEntry({ name: 'page001.jpeg' })).toBe(true)
    expect(isImageEntry({ name: 'page001.png' })).toBe(true)
    expect(isImageEntry({ name: 'page001.gif' })).toBe(true)
    expect(isImageEntry({ name: 'page001.webp' })).toBe(true)
    expect(isImageEntry({ name: 'page001.bmp' })).toBe(true)
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './cbz.js'`

- [ ] **Step 3: Implement `src/utils/cbz.js`**

```js
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: All 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/cbz.js src/utils/cbz.test.js
git commit -m "feat: add CBZ extraction utilities with tests"
```

---

## Task 3: App Shell

**Files:**
- Create: `src/App.jsx`

- [ ] **Step 1: Create `src/App.jsx`**

```jsx
import { useState } from 'react'
import UploadZone from './UploadZone.jsx'
import Reader from './Reader.jsx'

export default function App() {
  const [pages, setPages] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [view, setView] = useState('upload') // 'upload' | 'reader'

  function handleLoad(pageUrls) {
    setPages(pageUrls)
    setCurrentIndex(0)
    setView('reader')
  }

  function handleClose() {
    pages.forEach(url => URL.revokeObjectURL(url))
    setPages([])
    setCurrentIndex(0)
    setView('upload')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {view === 'upload' ? (
        <UploadZone onLoad={handleLoad} />
      ) : (
        <Reader
          pages={pages}
          currentIndex={currentIndex}
          onNavigate={setCurrentIndex}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
```

Note: `UploadZone` and `Reader` will be created in the next two tasks. The app won't render yet until all three exist.

- [ ] **Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add App shell with upload/reader view state"
```

---

## Task 4: UploadZone Component

**Files:**
- Create: `src/UploadZone.jsx`

- [ ] **Step 1: Create `src/UploadZone.jsx`**

```jsx
import { useState, useRef } from 'react'
import { isCbzFile, extractPages } from './utils/cbz.js'

export default function UploadZone({ onLoad }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  async function handleFile(file) {
    if (!isCbzFile(file)) {
      setError('Please upload a .cbz file')
      return
    }
    setError('')
    setLoading(true)
    try {
      const urls = await extractPages(file)
      onLoad(urls)
    } catch {
      setError('Failed to read file. Is it a valid .cbz?')
    } finally {
      setLoading(false)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onDragOver(e) {
    e.preventDefault()
  }

  function onChange(e) {
    const file = e.target.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={() => !loading && inputRef.current?.click()}
        className="border-2 border-dashed border-gray-600 rounded-2xl p-16 text-center cursor-pointer hover:border-indigo-500 transition-colors max-w-md w-full"
      >
        {loading ? (
          <div>
            <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-300 text-lg">Loading pages…</p>
          </div>
        ) : (
          <>
            <svg className="mx-auto mb-4 w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-8m0 0l-3 3m3-3l3 3M6 20h12a2 2 0 002-2V8l-6-6H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-200 text-xl font-medium mb-1">Drop a .cbz file here</p>
            <p className="text-gray-500 text-sm">or click to browse</p>
          </>
        )}
        {error && (
          <p className="text-red-400 mt-4 text-sm">{error}</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".cbz"
          onChange={onChange}
          className="hidden"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/UploadZone.jsx
git commit -m "feat: add UploadZone with drag-and-drop, validation, loading state"
```

---

## Task 5: Keyboard Hook

**Files:**
- Create: `src/useKeyboard.js`

- [ ] **Step 1: Create `src/useKeyboard.js`**

```js
import { useEffect } from 'react'

export function useKeyboard({ onPrev, onNext }) {
  useEffect(() => {
    function handler(e) {
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onPrev, onNext])
}
```

- [ ] **Step 2: Commit**

```bash
git add src/useKeyboard.js
git commit -m "feat: add useKeyboard hook for arrow key navigation"
```

---

## Task 6: Reader Component

**Files:**
- Create: `src/Reader.jsx`

- [ ] **Step 1: Create `src/Reader.jsx`**

```jsx
import { useCallback } from 'react'
import { useKeyboard } from './useKeyboard.js'

export default function Reader({ pages, currentIndex, onNavigate, onClose }) {
  const prev = useCallback(() => {
    onNavigate(i => Math.max(0, i - 1))
  }, [onNavigate])

  const next = useCallback(() => {
    onNavigate(i => Math.min(pages.length - 1, i + 1))
  }, [onNavigate, pages.length])

  useKeyboard({ onPrev: prev, onNext: next })

  const atStart = currentIndex === 0
  const atEnd = currentIndex === pages.length - 1

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-1"
        >
          ← Back
        </button>
        <span className="text-gray-400 text-sm tabular-nums">
          {currentIndex + 1} / {pages.length}
        </span>
        <div className="w-12" /> {/* spacer to balance the back button */}
      </div>

      {/* Page display with tap zones */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left tap zone */}
        <div
          className="absolute left-0 top-0 w-1/4 h-full z-10 cursor-pointer"
          onClick={prev}
        />

        {/* Image */}
        <div className="flex-1 flex items-center justify-center p-2">
          <img
            key={currentIndex}
            src={pages[currentIndex]}
            alt={`Page ${currentIndex + 1}`}
            className="max-h-full max-w-full object-contain"
            draggable={false}
          />
        </div>

        {/* Right tap zone */}
        <div
          className="absolute right-0 top-0 w-1/4 h-full z-10 cursor-pointer"
          onClick={next}
        />
      </div>

      {/* Footer navigation */}
      <div className="flex items-center justify-center gap-4 py-3 bg-gray-900 border-t border-gray-800">
        <button
          onClick={prev}
          disabled={atStart}
          className="px-4 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-colors"
        >
          ← Prev
        </button>
        <button
          onClick={next}
          disabled={atEnd}
          className="px-4 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/Reader.jsx
git commit -m "feat: add Reader with page display, nav buttons, tap zones, keyboard nav"
```

---

## Task 7: Smoke Test & Build Verification

- [ ] **Step 1: Run the dev server**

```bash
npm run dev
```

Expected: Server starts at `http://localhost:5173` (or similar port), no console errors.

- [ ] **Step 2: Manual test with the sample file**

Open `http://localhost:5173` in a browser. Drag and drop `Ben 10 001 (2026) (Series) (Dynamite Entertainment) (Digital) (LeDuch).cbz` (from the parent directory) onto the drop zone.

Expected:
- Loading spinner appears briefly
- Reader view opens showing page 1
- Clicking "Next →" / "Prev ←" advances pages
- Arrow keys navigate pages
- Clicking left 25% / right 25% of image area navigates pages
- Page counter updates (e.g., "2 / 46")
- Clicking "← Back" returns to upload zone

- [ ] **Step 3: Test error handling**

Drop any non-CBZ file (e.g., a `.jpg` or `.pdf`) onto the drop zone.

Expected: Red error message "Please upload a .cbz file" appears. No crash.

- [ ] **Step 4: Run unit tests**

```bash
npm test
```

Expected: All 8 tests PASS.

- [ ] **Step 5: Production build**

```bash
npm run build
```

Expected: `dist/` folder created. No build errors.

- [ ] **Step 6: Preview the production build**

```bash
npm run preview
```

Open the preview URL and repeat Step 2. Confirm the production build works identically.

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "chore: verify build passes, app works end-to-end"
```

---

## Deployment Notes

**Vercel:** Connect the `CDZ READER/` directory as the project root. Vercel auto-detects Vite. Build command: `npm run build`. Output dir: `dist`.

**GitHub Pages:** Use the `vite-plugin-gh-pages` package or manually push `dist/` to the `gh-pages` branch. Add `base: '/repo-name/'` to `vite.config.js` if deploying to a subdirectory.
