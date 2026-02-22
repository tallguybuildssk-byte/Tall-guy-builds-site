import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Login'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/app" element={<Login />} />
        <Route path="/app/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
