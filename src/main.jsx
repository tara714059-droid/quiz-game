import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { preloadBossImages } from './utils/dicebear.js'

// 預先載入所有關主圖片到瀏覽器快取
preloadBossImages()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
