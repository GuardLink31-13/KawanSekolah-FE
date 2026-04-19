// src/pages/OTPPage.tsx
//
// Halaman verifikasi OTP — hanya muncul setelah LOGIN berhasil.
// Email sudah ada di otpSlice (diisi oleh loginSlice).
// Setelah OTP verified → token disimpan → navigasi ke Dashboard.

import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setKode, tickCooldown, verifyOtp, resendOtp, resetOtp } from '../store/otpSlice'

interface Props {
  onSuccess: () => void   // OTP berhasil → Dashboard
  onBack:    () => void   // kembali → Login
}

export default function OTPPage({ onSuccess, onBack }: Props) {
  const dispatch = useAppDispatch()

  const email     = useAppSelector(s => s.otp.email)
  const kode      = useAppSelector(s => s.otp.kode)
  const loading   = useAppSelector(s => s.otp.loading)
  const resending = useAppSelector(s => s.otp.resending)
  const error     = useAppSelector(s => s.otp.error)
  const resendMsg = useAppSelector(s => s.otp.resendMsg)
  const cooldown  = useAppSelector(s => s.otp.cooldown)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown resend
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => dispatch(tickCooldown()), 1000)
    return () => clearInterval(timer)
  }, [cooldown, dispatch])

  const handleDigitChange = (index: number, value: string) => {
    const digit   = value.replace(/\D/g, '').slice(-1)
    const current = kode.split('')
    while (current.length < 6) current.push('')
    current[index] = digit
    dispatch(setKode(current.join('')))
    if (digit && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const current = kode.split('')
      if (current[index]) {
        current[index] = ''
        dispatch(setKode(current.join('')))
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
        const prev = kode.split('')
        prev[index - 1] = ''
        dispatch(setKode(prev.join('')))
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    dispatch(setKode(pasted))
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleVerify = async () => {
    const result = await dispatch(verifyOtp())
    if (verifyOtp.fulfilled.match(result)) {
      dispatch(resetOtp())
      onSuccess()   // → Login
    }
  }

  const handleBack = () => {
    dispatch(resetOtp())
    onBack()   // → Login
  }

  const maskedEmail = email.replace(/(.{1})(.*)(@.*)/, '$1***$3')

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-cream-DEFAULT">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="bg-sage rounded-t-2xl px-6 pt-6 pb-5">
          <p className="text-gold text-[10px] font-semibold tracking-[0.14em] uppercase mb-1">
            Portal Akademik
          </p>
          <h1 className="font-display text-white text-2xl leading-tight">
            Verifikasi OTP
          </h1>
          <p className="text-white/60 text-xs mt-1">
            Masukkan kode yang dikirim ke email
          </p>
        </div>

        {/* Card */}
        <div className="bg-cream-DEFAULT border border-cream-border border-t-0 rounded-b-2xl px-6 pt-5 pb-6">

          {/* Info email */}
          <div className="mb-5 bg-sage-pale rounded-xl p-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sage-mid flex-shrink-0" />
            <p className="text-xs text-sage font-medium">
              Kode dikirim ke <strong>{maskedEmail}</strong>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          {/* Resend success */}
          {resendMsg && !error && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl px-4 py-2.5">
              {resendMsg}
            </div>
          )}

          {/* 6-digit OTP input */}
          <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">
            Kode OTP
          </label>
          <div className="flex gap-2 justify-between mb-6" onPaste={handlePaste}>
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
                className={`w-11 h-12 text-center text-lg font-semibold rounded-xl border
                  bg-white text-ink transition-all duration-200 outline-none
                  focus:border-sage focus:ring-2 focus:ring-sage/20
                  ${kode[i] && !error ? 'border-sage bg-sage-pale text-sage' : ''}
                  ${error ? 'border-red-300 bg-red-50' : 'border-cream-border'}
                `}
              />
            ))}
          </div>

          {/* Tombol verifikasi */}
          <button
            onClick={handleVerify}
            disabled={loading || kode.length !== 6}
            className="w-full bg-gold text-sage font-semibold text-sm rounded-xl py-3.5
              flex items-center justify-center gap-2
              transition hover:bg-[#C9A227] active:scale-[0.98]
              disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-sage/30 border-t-sage rounded-full animate-spin" />
                Memverifikasi...
              </>
            ) : (
              'Verifikasi Sekarang'
            )}
          </button>

          {/* Kirim ulang */}
          <div className="mt-4 text-center">
            {cooldown > 0 ? (
              <p className="text-xs text-ink-muted">
                Kirim ulang dalam{' '}
                <span className="font-semibold text-sage">{cooldown}s</span>
              </p>
            ) : (
              <button
                onClick={() => dispatch(resendOtp())}
                disabled={resending}
                className="text-xs text-sage font-semibold hover:underline
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? 'Mengirim ulang...' : 'Kirim ulang kode OTP'}
              </button>
            )}
          </div>

          {/* Kembali ke login */}
          <div className="mt-3 text-center">
            <button
              onClick={handleBack}
              className="text-xs text-ink-muted hover:text-ink transition"
            >
              ← Kembali ke pendaftaran
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
