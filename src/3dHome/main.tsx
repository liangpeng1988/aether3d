import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home3D from './Home3D'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Home3D />
  </StrictMode>,
)