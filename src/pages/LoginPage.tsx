// src/pages/LoginPage.tsx

import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setEmail, setPassword, toggleShowPass, submitLogin, resetLogin } from '../store/loginSlice'

interface Props {
  onSuccess:      () => void
  onGoRegister:   () => void
  onGoForgot:     () => void   // ← link lupa password
}

export default function LoginPage({ onSuccess, onGoRegister, onGoForgot }: Props) {
  const dispatch = useAppDispatch()

  const email    = useAppSelector(s => s.login.email)
  const password = useAppSelector(s => s.login.password)
  const loading  = useAppSelector(s => s.login.loading)
  const error    = useAppSelector(s => s.login.error)
  const showPass = useAppSelector(s => s.login.showPass)

  const handleSubmit = async () => {
    const result = await dispatch(submitLogin())
    if (submitLogin.fulfilled.match(result)) {
      dispatch(resetLogin())
      onSuccess()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) handleSubmit()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-cream-DEFAULT">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="bg-sage rounded-t-2xl px-6 pt-6 pb-6">
          <p className="text-gold text-[10px] font-semibold tracking-[0.14em] uppercase mb-1">
            Portal Akademik
          </p>
          <h1 className="font-display text-white text-2xl leading-tight">
            Selamat datang
          </h1>
          <p className="text-white/60 text-xs mt-1">
            Masuk ke akun Anda untuk melanjutkan
          </p>
        </div>

        {/* Form card */}
        <div className="bg-cream-DEFAULT border border-cream-border border-t-0 rounded-b-2xl px-6 pt-5 pb-6">

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label className="field-label">Email</label>
            <input
              type="email"
              className="field"
              placeholder="contoh@email.com"
              value={email}
              onChange={e => dispatch(setEmail(e.target.value))}
              onKeyDown={handleKeyDown}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="mb-1">
            <div className="flex items-center justify-between mb-1">
              <label className="field-label mb-0">Password</label>
              {/* ← Link lupa password di sebelah kanan label */}
              <button
                type="button"
                onClick={onGoForgot}
                className="text-xs text-sage font-semibold hover:underline"
              >
                Lupa password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="field pr-10"
                placeholder="Masukkan password"
                value={password}
                onChange={e => dispatch(setPassword(e.target.value))}
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => dispatch(toggleShowPass())}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition"
                tabIndex={-1}
              >
                {showPass ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Tombol login */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-6 w-full bg-gold text-sage font-semibold text-sm rounded-xl py-3.5
              flex items-center justify-center gap-2
              transition hover:bg-[#C9A227] active:scale-[0.98]
              disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-sage/30 border-t-sage rounded-full animate-spin" />
                Masuk...
              </>
            ) : (
              'Masuk'
            )}
          </button>

          <p className="text-center text-xs text-ink-muted mt-4">
            Belum punya akun?{' '}
            <button onClick={onGoRegister} className="text-sage font-semibold hover:underline">
              Daftar sekarang
            </button>
          </p>

        </div>
      </div>
    </div>
  )
}