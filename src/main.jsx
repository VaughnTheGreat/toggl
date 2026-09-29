import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { saveStore } from '@/lib/game/persist'
import { loadCloud } from '@/lib/cloud'

// Load the save (and copy it into native storage on first launch) before anything reads it.
saveStore.init().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
  )
  // Background cloud sync (iOS app only; a no-op on the web). Never blocks the game.
  loadCloud().catch((e) => console.warn('[sync] failed to start', e))
})
