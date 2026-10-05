import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// Fonts are bundled with the app rather than loaded from Google, so the page
// makes no outside requests at all - only the weights actually used. A font
// only downloads when a look on screen uses it.
import '@fontsource/public-sans/latin-400.css'
import '@fontsource/public-sans/latin-600.css'
import '@fontsource/public-sans/latin-700.css'
import '@fontsource/source-serif-4/latin-600.css'
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/jetbrains-mono/latin-700.css'
import '@fontsource/geist-sans/latin-400.css'
import '@fontsource/geist-sans/latin-500.css'
import '@fontsource/geist-sans/latin-600.css'
import './looks.css'
import './index.css'
import { applyLook, initialLook } from './look.js'

// Set the look before the first paint, so the page never flashes Calm first.
applyLook(initialLook())

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
