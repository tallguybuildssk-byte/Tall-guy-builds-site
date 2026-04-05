import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login'
import Dashboard from './dashboard'
import DeckDesigner from './DeckDesigner'
import { supabase } from './supabase'

const reset = document.createElement('style')
reset.textContent = `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { background: #16212E; }`
document.head.appendChild(reset)

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div style={{
        background: '#16212E',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#C8A96A',
        fontSize: 18,
        fontFamily: 'Georgia, serif'
      }}>
        Loading...
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dashboard/tools/deck-designer" element={<ProtectedRoute><DeckDesigner /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
