// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'      // ← 1. Import Provider
import { store }    from './store/store'    // ← 2. Import store
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 3. Bungkus seluruh app dengan Provider + store */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
)