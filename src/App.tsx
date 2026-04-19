// src/App.tsx
//
// Flow navigasi lengkap:
//   register → otp → login → dashboard
//   login → forgot → (otp reset → password baru → selesai) → login

import { useState } from 'react'
import LoginPage           from './pages/LoginPage'
import RegisterPage        from './pages/RegisterPage'
import OTPPage             from './pages/Otp'
import ForgotPasswordPage  from './pages/ForgotPasswordPage'

type Page = 'login' | 'register' | 'otp' | 'forgot' | 'dashboard'

export default function App() {
  const [page, setPage] = useState<Page>('login')

  return (
    <>
      {page === 'login' && (
        <LoginPage
          onSuccess={()    => setPage('dashboard')}
          onGoRegister={() => setPage('register')}
          onGoForgot={()   => setPage('forgot')}     // ← lupa password
        />
      )}

      {page === 'register' && (
        <RegisterPage
          onGoLogin={() => setPage('login')}
          onGoOtp={()   => setPage('otp')}
        />
      )}

      {page === 'otp' && (
        <OTPPage
          onSuccess={() => setPage('login')}
          onBack={()    => setPage('register')}
        />
      )}

      {page === 'forgot' && (
        <ForgotPasswordPage
          onBack={() => setPage('login')}            // kembali ke login
        />
      )}

      {page === 'dashboard' && (
        <div className="min-h-screen flex items-center justify-center bg-cream-DEFAULT">
          <p className="text-sage font-semibold">Dashboard — coming soon</p>
        </div>
      )}
    </>
  )
}