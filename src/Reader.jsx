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
    <div className="h-screen overflow-hidden bg-gray-950 flex flex-col select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-1"
        >
          ← Back
        </button>
        <span className="text-gray-400 text-sm tabular-nums" aria-live="polite">
          {currentIndex + 1} / {pages.length}
        </span>
        <div className="w-12" /> {/* spacer to balance the back button */}
      </div>

      {/* Page display with tap zones */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left tap zone */}
        {!atStart && (
          <div
            role="button"
            aria-label="Previous page"
            tabIndex={-1}
            className="absolute left-0 top-0 w-1/4 h-full z-10 cursor-pointer"
            onClick={prev}
          />
        )}

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
        {!atEnd && (
          <div
            role="button"
            aria-label="Next page"
            tabIndex={-1}
            className="absolute right-0 top-0 w-1/4 h-full z-10 cursor-pointer"
            onClick={next}
          />
        )}
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
