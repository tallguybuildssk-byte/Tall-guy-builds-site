import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Login'
const globalStyle = document.createElement('style')
globalStyle.innerHTML = `* { margin: 0; padding: 0; box-sizing: border-box; } html, body { height: 100%; }`
document.head.appendChild(globalStyle)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
