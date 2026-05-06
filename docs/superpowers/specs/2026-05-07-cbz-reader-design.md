# CBZ Reader — Design Spec
_Date: 2026-05-07_

## Context

The user wants a lightweight webapp to upload and read `.cbz` (comic book archive) files one at a time. CBZ files are ZIP archives containing sequentially named image files. The app must run entirely client-side so it can be hosted for free on Vercel or GitHub Pages with no backend.

## Tech Stack

- **React + Vite** — static SPA, zero-config Vercel deployment
- **Tailwind CSS** — utility-first styling, dark theme
- **JSZip** — in-browser ZIP extraction, no server required

## Architecture

Two views controlled by a single state flag in `App` — no router needed:

1. **Upload view** — shown on load and after closing a book
2. **Reader view** — shown after a file is successfully loaded

All page images are held as object URLs in memory. On close, all URLs are revoked to free memory.

## Components

| Component | Responsibility |
|---|---|
| `App` | Global state: `pages[]`, `currentIndex`, `view` |
| `UploadZone` | Drag-and-drop + file input; invokes JSZip; sorts pages; passes array to `App` |
| `Reader` | Renders current page, prev/next buttons, page counter, close button |
| `useKeyboard` | Hook — listens for `←`/`→` arrow keys to navigate |

## Data Flow

1. User drops or selects a `.cbz` file in `UploadZone`
2. `UploadZone` passes the file to JSZip, extracts all image entries, sorts by filename
3. Each image is converted to an object URL; the array is passed to `App`
4. `App` sets `view = "reader"` and `pages = [...]`
5. `Reader` renders `pages[currentIndex]`; user navigates with buttons, keyboard, or tap zones

## UX & Error Handling

- Non-CBZ file dropped → inline error in upload zone ("Please upload a .cbz file")
- Extraction in progress → loading spinner ("Loading pages…")
- Images sorted alphanumerically by filename to guarantee correct page order
- Left/right edge tap zones for mobile navigation
- Page counter at bottom: "Page X of Y"
- Close/back button revokes all object URLs and returns to upload view

## Verification

1. Run `npm install && npm run dev` in `CDZ READER/`
2. Drop `Ben 10 001 (2026)...cbz` into the upload zone — pages should load in order
3. Navigate with arrow keys and buttons
4. Drop a non-image ZIP — error message should appear
5. Run `npm run build` — `dist/` folder should be deployable to Vercel/GitHub Pages
