import { useState, useRef } from 'react'
import { isCbzFile, extractPages } from './utils/cbz.js'

export default function UploadZone({ onLoad }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
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
      if (inputRef.current) inputRef.current.value = ''
      setLoading(false)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onDragOver(e) {
    e.preventDefault()
  }

  function onDragEnter(e) {
    e.preventDefault()
    setDragActive(true)
  }

  function onDragLeave(e) {
    e.preventDefault()
    setDragActive(false)
  }

  function onChange(e) {
    const file = e.target.files[0]
    if (file) handleFile(file)
  }

  const borderClass = dragActive
    ? 'border-indigo-400'
    : 'border-gray-600 hover:border-indigo-500'

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onClick={() => !loading && inputRef.current?.click()}
        className={`border-2 border-dashed ${borderClass} rounded-2xl p-16 text-center max-w-md w-full transition-colors ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
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
