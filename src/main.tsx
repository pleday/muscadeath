import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { CartProvider } from './context/CartContext'
import { ConfigProvider } from './context/ConfigContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ConfigProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </ConfigProvider>
    </BrowserRouter>
  </StrictMode>,
)
