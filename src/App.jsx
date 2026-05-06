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
