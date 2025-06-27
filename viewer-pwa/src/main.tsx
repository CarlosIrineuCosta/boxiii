import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'  // Commented out to avoid Tailwind issues
import SimpleApp from './SimpleApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SimpleApp />
  </StrictMode>,
)
