// Importer la configuration des futures flags avant tout autre import de react-router-dom
import './router-future-flags.js'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Importer la configuration d'Axios pour les intercepteurs JWT
import './utils/axiosConfig'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
