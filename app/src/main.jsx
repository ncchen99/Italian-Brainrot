import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppSessionProvider } from './contexts/AppSessionContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppSessionProvider>
      <App />
    </AppSessionProvider>
  </StrictMode>,
)
