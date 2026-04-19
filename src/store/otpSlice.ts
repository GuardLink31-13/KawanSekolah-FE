  // src/store/otpSlice.ts
  //
  // OTP digunakan setelah REGISTER — bukan setelah login.
  // Flow: Register berhasil → setOtpEmail(email) → OTPPage → verifyOtp → saveToken → Login

  import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
  import { apiVerifyOtp, apiResendOtp, saveToken } from '../Api'

  interface OtpState {
    email:     string   // email dari registerSlice setelah register berhasil
    kode:      string   // 6 digit yang diketik user
    loading:   boolean
    resending: boolean
    error:     string
    resendMsg: string
    cooldown:  number
  }

  const initialState: OtpState = {
    email:     '',
    kode:      '',
    loading:   false,
    resending: false,
    error:     '',
    resendMsg: '',
    cooldown:  0,
  }

  /** Verifikasi OTP setelah register — token disimpan di sini */
 export const verifyOtp = createAsyncThunk(
  'otp/verify',
  async (_, { getState, rejectWithValue }) => {
    const { email, kode } = (getState() as { otp: OtpState }).otp

    if (!email)            return rejectWithValue('Email tidak ditemukan')
    if (kode.length !== 6) return rejectWithValue('Masukkan 6 digit kode OTP')

    try {
      const res = await apiVerifyOtp({ email, kode })

      // ✅ Handle token di root ATAU di dalam data
      console.log('[OTP Response]', res) // hapus setelah debug
      const token = res?.token ?? res?.data?.token

      if (!token) return rejectWithValue('Token tidak ditemukan dari server')
      saveToken(token)
      return res
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Verifikasi gagal')
    }
  }
)

  /** Kirim ulang OTP */
  export const resendOtp = createAsyncThunk(
    'otp/resend',
    async (_, { getState, rejectWithValue }) => {
      const { email } = (getState() as { otp: OtpState }).otp

      if (!email) return rejectWithValue('Email tidak ditemukan')

      try {
        const res = await apiResendOtp({ email })
        return res
      } catch (e: unknown) {
        return rejectWithValue(e instanceof Error ? e.message : 'Gagal mengirim ulang OTP')
      }
    }
  )

  const otpSlice = createSlice({
    name: 'otp',
    initialState,
    reducers: {
      // Dipanggil dari RegisterPage setelah register berhasil
      setOtpEmail(state, action: PayloadAction<string>) {
        state.email     = action.payload
        state.kode      = ''
        state.error     = ''
        state.resendMsg = ''
        state.cooldown  = 0
      },
      setKode(state, action: PayloadAction<string>) {
        state.kode  = action.payload.replace(/\D/g, '').slice(0, 6)
        state.error = ''
      },
      tickCooldown(state) {
        if (state.cooldown > 0) state.cooldown -= 1
      },
      clearError(state) {
        state.error     = ''
        state.resendMsg = ''
      },
      resetOtp() {
        return initialState
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(verifyOtp.pending, (state) => {
          state.loading = true
          state.error   = ''
        })
        .addCase(verifyOtp.fulfilled, (state) => {
          state.loading = false
          // Navigasi ke Login ditangani komponen via onSuccess()
        })
        .addCase(verifyOtp.rejected, (state, action) => {
          state.loading = false
          state.error   = (action.payload as string) ?? 'Verifikasi gagal'
          state.kode    = ''
        })

      builder
        .addCase(resendOtp.pending, (state) => {
          state.resending = true
          state.error     = ''
          state.resendMsg = ''
        })
        .addCase(resendOtp.fulfilled, (state, action) => {
          state.resending = false
          state.resendMsg = action.payload?.message ?? 'Kode OTP baru telah dikirim'
          state.cooldown  = 60
          state.kode      = ''
        })
        .addCase(resendOtp.rejected, (state, action) => {
          state.resending = false
          state.error     = (action.payload as string) ?? 'Gagal mengirim ulang OTP'
        })
    },
  })

  export const { setOtpEmail, setKode, tickCooldown, clearError, resetOtp } = otpSlice.actions
  export default otpSlice.reducer