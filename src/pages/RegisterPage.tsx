// src/pages/RegisterPage.tsx
//
// Flow: Register berhasil → setOtpEmail(email) → OTPPage

import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setField, goNext, goBack, submitRegister, resetRegister } from '../store/registerSlice'
import { setOtpEmail } from '../store/otpSlice'

import StepInfo    from '../components/register/StepInfo'
import StepSekolah from '../components/register/StepSekolah'
import StepMatpel  from '../components/register/StepMatpel'

interface Props {
  onGoLogin: () => void   // tombol "sudah punya akun"
  onGoOtp:   () => void   // register berhasil → OTP
}

const STEP_TITLES = ['Informasi akun', 'Data sekolah', 'Kelas & mata pelajaran']
const STEP_LABELS = ['Info', 'Sekolah', 'Matpel']

export default function RegisterPage({ onGoLogin, onGoOtp }: Props) {
  const dispatch = useAppDispatch()

  const formData = useAppSelector(s => s.register.formData)
  const step     = useAppSelector(s => s.register.step)
  const error    = useAppSelector(s => s.register.error)
  const loading  = useAppSelector(s => s.register.loading)

  const handleChange = (field: string, value: string | string[]) => {
    dispatch(setField({ field, value: value as string }))
  }

  const handleNext = () => dispatch(goNext())
  const handleBack = () => dispatch(goBack())

  const handleSubmit = async () => {
    const result = await dispatch(submitRegister(formData))
    if (submitRegister.fulfilled.match(result)) {
      dispatch(setOtpEmail(formData.email))   // kirim email ke otpSlice
      dispatch(resetRegister())
      onGoOtp()                               // → OTPPage
    }
  }

  const handleGoLogin = () => {
    dispatch(resetRegister())
    onGoLogin()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-cream-DEFAULT">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="bg-sage rounded-t-2xl px-6 pt-6 pb-5">
          <p className="text-gold text-[10px] font-semibold tracking-[0.14em] uppercase mb-1">
            Portal Akademik
          </p>
          <h1 className="font-display text-white text-2xl leading-tight">Buat akun baru</h1>
          <p className="text-white/60 text-xs mt-1">{STEP_TITLES[step]}</p>
        </div>

        {/* Stepper */}
        <div className="bg-sage flex items-center gap-0 px-6 pb-4 border-b border-white/10">
          {STEP_LABELS.map((_, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 border transition-all
                ${i === step
                  ? 'bg-gold text-sage border-gold'
                  : i < step
                    ? 'bg-white/15 text-white/80 border-white/40'
                    : 'bg-transparent text-white/40 border-white/25'
                }`}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < 2 && (
                <div className={`flex-1 h-px mx-1 ${i < step ? 'bg-white/35' : 'bg-white/15'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-cream-DEFAULT border border-cream-border border-t-0 rounded-b-2xl px-6 pt-5 pb-6">

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          {step === 0 && <StepInfo data={formData} onChange={handleChange} />}
          {step === 1 && <StepSekolah />}
          {step === 2 && <StepMatpel />}

          {step === 0 && (
            <button onClick={handleNext}
              className="mt-6 w-full bg-gold text-sage font-semibold text-sm rounded-xl py-3.5
                transition hover:bg-[#C9A227] active:scale-[0.98]">
              Lanjut →
            </button>
          )}

          {(step === 1 || step === 2) && (
            <div className="mt-6 flex gap-3">
              <button onClick={handleBack}
                className="flex-1 border border-cream-border text-ink text-sm font-medium rounded-xl py-3
                  hover:bg-cream-dark transition">
                ← Kembali
              </button>
              {step === 1 && (
                <button onClick={handleNext}
                  className="flex-[2] bg-sage text-white text-sm font-semibold rounded-xl py-3
                    hover:bg-[#245a42] transition active:scale-[0.98]">
                  Lanjut →
                </button>
              )}
              {step === 2 && (
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-[2] bg-gold text-sage text-sm font-semibold rounded-xl py-3
                    flex items-center justify-center gap-2
                    hover:bg-[#C9A227] transition active:scale-[0.98]
                    disabled:opacity-70 disabled:cursor-not-allowed">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-sage/30 border-t-sage rounded-full animate-spin" />Mendaftar...</>
                    : 'Daftar Sekarang'
                  }
                </button>
              )}
            </div>
          )}

          <p className="text-center text-xs text-ink-muted mt-4">
            Sudah punya akun?{' '}
            <button onClick={handleGoLogin} className="text-sage font-semibold hover:underline">
              Masuk
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}