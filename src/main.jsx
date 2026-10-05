import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// Fonts are bundled with the app rather than loaded from Google, so the page
// makes no outside requests at all - only the weights actually used.
import '@fontsource/geist-sans/latin-400.css'
import '@fontsource/geist-sans/latin-500.css'
import '@fontsource/geist-sans/latin-600.css'
import '@fontsource/geist-mono/latin-400.css'
import '@fontsource/geist-mono/latin-500.css'
import './tokens.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
