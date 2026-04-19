// src/pages/ForgotPasswordPage.tsx

import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  setForgotEmail,
  setForgotKode,
  setNewPassword,
  setConfirmPassword,
  toggleShowPass,
  toggleShowConfirm,
  tickCooldown,
  resetForgot,
  sendForgotEmail,
  verifyResetOtp,
  resendResetOtp,
  submitNewPassword,
} from '../store/forgotPasswordSlice'

interface Props {
  onBack: () => void
}

export default function ForgotPasswordPage({ onBack }: Props) {
  const dispatch = useAppDispatch()

  const step            = useAppSelector((s: any) => s.forgotPassword.step)
  const email           = useAppSelector((s: any) => s.forgotPassword.email)
  const kode            = useAppSelector((s: any) => s.forgotPassword.kode)
  const newPassword     = useAppSelector((s: any) => s.forgotPassword.newPassword)
  const confirmPassword = useAppSelector((s: any) => s.forgotPassword.confirmPassword)
  const showPass        = useAppSelector((s: any) => s.forgotPassword.showPass)
  const showConfirm     = useAppSelector((s: any) => s.forgotPassword.showConfirm)
  const loading         = useAppSelector((s: any) => s.forgotPassword.loading)
  const resending       = useAppSelector((s: any) => s.forgotPassword.resending)
  const error           = useAppSelector((s: any) => s.forgotPassword.error)
  const resendMsg       = useAppSelector((s: any) => s.forgotPassword.resendMsg)
  const cooldown        = useAppSelector((s: any) => s.forgotPassword.cooldown)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => dispatch(tickCooldown()), 1000)
    return () => clearInterval(t)
  }, [cooldown, dispatch])

  const handleDigitChange = (index: number, value: string) => {
    const digit   = value.replace(/\D/g, '').slice(-1)
    const current = kode.padEnd(6, ' ').split('')  // ✅ fix: hindari array pendek
    current[index] = digit
    dispatch(setForgotKode(current.join('').trimEnd()))
    if (digit && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const current = kode.padEnd(6, ' ').split('')
      if (current[index]?.trim()) {
        current[index] = ''
        dispatch(setForgotKode(current.join('').trimEnd()))
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
        const prev = kode.padEnd(6, ' ').split('')
        prev[index - 1] = ''
        dispatch(setForgotKode(prev.join('').trimEnd()))
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    dispatch(setForgotKode(pasted))
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  // ✅ fix: handleVerifyOtp dan handleNewPassword perlu await untuk cek hasil
  const handleSendEmail = () => dispatch(sendForgotEmail())

  const handleVerifyOtp = async () => {
    const result = await dispatch(verifyResetOtp())
    // navigasi ke step 2 sudah dihandle di extraReducers slice
    if (verifyResetOtp.rejected.match(result)) {
      // error sudah masuk ke state.error, tidak perlu apa-apa
    }
  }

  const handleResend      = () => dispatch(resendResetOtp())

  const handleNewPassword = async () => {
    const result = await dispatch(submitNewPassword())
    // navigasi ke step 3 sudah dihandle di extraReducers slice
    if (submitNewPassword.rejected.match(result)) {
      // error sudah masuk ke state.error
    }
  }

  const handleBack = () => {
    dispatch(resetForgot())
    onBack()
  }

  const maskedEmail = email
    ? email.replace(/(.{1})(.*)(@.*)/, '$1***$3')  // ✅ fix: guard jika email kosong
    : ''

  const TITLES = [
    { title: 'Lupa password',  sub: 'Masukkan email terdaftar Anda' },
    { title: 'Verifikasi OTP', sub: maskedEmail ? `Kode dikirim ke ${maskedEmail}` : '' },
    { title: 'Password baru',  sub: 'Buat password baru yang kuat' },
    { title: 'Berhasil!',      sub: '' },
  ]

  // ✅ fix: guard jika step di luar range (misal setelah reset)
  const currentTitle = TITLES[step] ?? TITLES[0]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-cream-DEFAULT">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="bg-sage rounded-t-2xl px-6 pt-6 pb-5">
          <p className="text-gold text-[10px] font-semibold tracking-[0.14em] uppercase mb-1">
            Portal Akademik
          </p>
          <h1 className="font-display text-white text-2xl leading-tight">
            {currentTitle.title}
          </h1>
          {currentTitle.sub && (
            <p className="text-white/60 text-xs mt-1">{currentTitle.sub}</p>
          )}
          {step < 3 && (
            <div className="flex items-center gap-1.5 mt-3">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300
                    ${i === step ? 'w-6 bg-gold' : i < step ? 'w-4 bg-white/40' : 'w-4 bg-white/20'}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Card */}
        <div className="bg-cream-DEFAULT border border-cream-border border-t-0 rounded-b-2xl px-6 pt-5 pb-6">

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          {resendMsg && !error && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl px-4 py-2.5">
              {resendMsg}
            </div>
          )}

          {/* STEP 0 */}
          {step === 0 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="field-label">Email</label>
                <input
                  type="email"
                  className="field"
                  placeholder="Email yang terdaftar"
                  value={email}
                  onChange={e => dispatch(setForgotEmail(e.target.value))}
                  onKeyDown={e => e.key === 'Enter' && handleSendEmail()}
                  autoComplete="email"
                />
              </div>
              <button
                onClick={handleSendEmail}
                disabled={loading || !email.trim()}  // ✅ fix: disable jika email kosong
                className="w-full bg-gold text-sage font-semibold text-sm rounded-xl py-3.5
                  flex items-center justify-center gap-2 transition
                  hover:bg-[#C9A227] active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-sage/30 border-t-sage rounded-full animate-spin" />Mengirim...</>
                  : 'Kirim Kode OTP'
                }
              </button>
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="animate-fadeIn">
              <div className="mb-4 bg-sage-pale rounded-xl p-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sage-mid flex-shrink-0" />
                <p className="text-xs text-sage font-medium">
                  Kode dikirim ke <strong>{maskedEmail}</strong>
                </p>
              </div>

              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">
                Kode OTP
              </label>

              <div className="flex gap-2 justify-between mb-5" onPaste={handlePaste}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={kode[i] ?? ''}
                    onChange={e => handleDigitChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onFocus={e => e.target.select()}
                    className={[
                      'w-11 h-12 text-center text-lg font-semibold rounded-xl border',
                      'bg-white text-ink transition-all duration-200 outline-none',
                      'focus:border-sage focus:ring-2 focus:ring-sage/20',
                      error
                        ? 'border-red-300 bg-red-50'
                        : kode[i]
                        ? 'border-sage bg-sage-pale text-sage'
                        : 'border-cream-border',
                    ].join(' ')}
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading || kode.replace(/\s/g, '').length !== 6}  // ✅ fix: trim spasi
                className="w-full bg-gold text-sage font-semibold text-sm rounded-xl py-3.5
                  flex items-center justify-center gap-2 transition
                  hover:bg-[#C9A227] active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-sage/30 border-t-sage rounded-full animate-spin" />Memverifikasi...</>
                  : 'Verifikasi Kode'
                }
              </button>

              <div className="mt-4 text-center">
                {cooldown > 0 ? (
                  <p className="text-xs text-ink-muted">
                    Kirim ulang dalam <span className="font-semibold text-sage">{cooldown}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="text-xs text-sage font-semibold hover:underline disabled:opacity-50"
                  >
                    {resending ? 'Mengirim ulang...' : 'Kirim ulang kode OTP'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="field-label">Password Baru</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="field pr-10"
                    placeholder="Minimal 8 karakter"
                    value={newPassword}
                    onChange={e => dispatch(setNewPassword(e.target.value))}
                  />
                  <button
                    type="button"
                    onClick={() => dispatch(toggleShowPass())}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                    tabIndex={-1}
                  >
                    {showPass
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    }
                  </button>
                </div>
                {newPassword.length > 0 && (
                  <div className="mt-1.5 flex gap-1">
                    {[1, 2, 3].map(level => {
                      const strength = newPassword.length < 8 ? 1 : newPassword.length < 12 ? 2 : 3
                      return (
                        <div key={level} className={`h-1 flex-1 rounded-full transition-all ${
                          level <= strength
                            ? strength === 1 ? 'bg-red-400' : strength === 2 ? 'bg-amber-400' : 'bg-sage'
                            : 'bg-cream-border'
                        }`} />
                      )
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="field-label">Konfirmasi Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className={`field pr-10 ${
                      confirmPassword && confirmPassword !== newPassword ? 'border-red-300 focus:border-red-400'
                      : confirmPassword && confirmPassword === newPassword ? 'border-sage' : ''
                    }`}
                    placeholder="Ulangi password baru"
                    value={confirmPassword}
                    onChange={e => dispatch(setConfirmPassword(e.target.value))}
                  />
                  <button
                    type="button"
                    onClick={() => dispatch(toggleShowConfirm())}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                    tabIndex={-1}
                  >
                    {showConfirm
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    }
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <p className={`text-xs mt-1 ${confirmPassword === newPassword ? 'text-sage' : 'text-red-500'}`}>
                    {confirmPassword === newPassword ? '✓ Password cocok' : '✗ Password tidak cocok'}
                  </p>
                )}
              </div>

              <button
                onClick={handleNewPassword}
                // ✅ fix: disable jika password tidak memenuhi syarat
                disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
                className="w-full bg-gold text-sage font-semibold text-sm rounded-xl py-3.5
                  flex items-center justify-center gap-2 transition
                  hover:bg-[#C9A227] active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-sage/30 border-t-sage rounded-full animate-spin" />Menyimpan...</>
                  : 'Simpan Password Baru'
                }
              </button>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="flex flex-col items-center text-center py-4 animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-sage-pale flex items-center justify-center mb-5">
                <svg className="w-10 h-10 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-xl text-sage mb-2">Password Berhasil Diubah!</h2>
              <p className="text-sm text-ink-muted mb-6 leading-relaxed">
                Silakan masuk dengan password baru Anda.
              </p>
              <button
                onClick={handleBack}
                className="w-full bg-gold text-sage font-semibold text-sm rounded-xl py-3.5
                  transition hover:bg-[#C9A227] active:scale-[0.98]"
              >
                Masuk Sekarang →
              </button>
            </div>
          )}

          {step < 3 && (
            <div className="mt-3 text-center">
              <button onClick={handleBack} className="text-xs text-ink-muted hover:text-ink transition">
                ← Kembali ke login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}