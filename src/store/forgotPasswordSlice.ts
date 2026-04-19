import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { request } from '../Api'

// ─── STATE ─────────────────────────────────────────────
interface ForgotState {
  step:            number
  email:           string
  kode:            string
  resetToken:      string
  newPassword:     string
  confirmPassword: string
  showPass:        boolean
  showConfirm:     boolean
  loading:         boolean
  resending:       boolean
  error:           string
  resendMsg:       string
  cooldown:        number
}

const initialState: ForgotState = {
  step:            0,
  email:           '',
  kode:            '',
  resetToken:      '',
  newPassword:     '',
  confirmPassword: '',
  showPass:        false,
  showConfirm:     false,
  loading:         false,
  resending:       false,
  error:           '',
  resendMsg:       '',
  cooldown:        0,
}

// ─── THUNKS ─────────────────────────────────────────────
export const sendForgotEmail = createAsyncThunk(
  'forgot/sendEmail',
  async (_, { getState, rejectWithValue }) => {
    const { email } = (getState() as any).forgotPassword
    if (!email.trim()) return rejectWithValue('Email wajib diisi')
    try {
      return await request('/auth/forgot-password', { email })
    } catch (e: any) { return rejectWithValue(e.message) }
  }
)

export const verifyResetOtp = createAsyncThunk(
  'forgot/verifyOtp',
  async (_, { getState, rejectWithValue }) => {
    const { email, kode } = (getState() as any).forgotPassword
    if (!email)            return rejectWithValue('Email tidak ditemukan')
    if (kode.length !== 6) return rejectWithValue('Masukkan 6 digit OTP')
    try {
      const res = await request<any>('/auth/verify-reset-otp', { email, kode })
      console.log('[Forgot OTP Response]', res) // hapus setelah debug
      return res
    } catch (e: any) { return rejectWithValue(e.message) }
  }
)

export const resendResetOtp = createAsyncThunk(
  'forgot/resendOtp',
  async (_, { getState, rejectWithValue }) => {
    const { email } = (getState() as any).forgotPassword
    try {
      return await request('/auth/forgot-password', { email })
    } catch (e: any) { return rejectWithValue(e.message) }
  }
)

export const submitNewPassword = createAsyncThunk(
  'forgot/submitPassword',
  async (_, { getState, rejectWithValue }) => {
    const stateData = (getState() as any).forgotPassword
    const token = stateData.resetToken || localStorage.getItem('reset_token')
    const { newPassword, confirmPassword } = stateData

    if (!token)                          return rejectWithValue('Token tidak ditemukan')
    if (newPassword.length < 8)          return rejectWithValue('Password minimal 8 karakter')
    if (newPassword !== confirmPassword)  return rejectWithValue('Password tidak cocok')
    try {
      return await request('/auth/reset-password', {
        reset_token:      token,
        password:         newPassword,
        confirm_password: confirmPassword,
      })
    } catch (e: any) { return rejectWithValue(e.message) }
  }
)

// ─── SLICE ─────────────────────────────────────────────
const forgotPasswordSlice = createSlice({
  name: 'forgotPassword',
  initialState,
  reducers: {
    setForgotEmail(state, action: PayloadAction<string>) {
      state.email = action.payload
      state.error = ''
    },
    setForgotKode(state, action: PayloadAction<string>) {
      state.kode = action.payload.replace(/\D/g, '').slice(0, 6)
      state.error = ''
    },
    setNewPassword(state, action: PayloadAction<string>) {
      state.newPassword = action.payload
      state.error = ''
    },
    setConfirmPassword(state, action: PayloadAction<string>) {
      state.confirmPassword = action.payload
      state.error = ''
    },
    toggleShowPass(state) {
      state.showPass = !state.showPass
    },
    toggleShowConfirm(state) {
      state.showConfirm = !state.showConfirm
    },
    tickCooldown(state) {
      if (state.cooldown > 0) state.cooldown--
    },
    resetForgot() {
      localStorage.removeItem('reset_token')
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendForgotEmail.pending,   (state)         => { state.loading = true;  state.error = '' })
      .addCase(sendForgotEmail.fulfilled, (state)         => { state.loading = false; state.step = 1; state.cooldown = 60 })
      .addCase(sendForgotEmail.rejected,  (state, action) => { state.loading = false; state.error = action.payload as string })

    builder
      .addCase(verifyResetOtp.pending,    (state)         => { state.loading = true;  state.error = '' })
      .addCase(verifyResetOtp.fulfilled,  (state, action) => {
        state.loading = false
        const token = action.payload?.data?.reset_token ?? action.payload?.reset_token
        if (!token) { state.error = 'Reset token tidak ditemukan'; return }
        state.resetToken = token
        localStorage.setItem('reset_token', token)
        state.step = 2
      })
      .addCase(verifyResetOtp.rejected,   (state, action) => { state.loading = false; state.error = action.payload as string; state.kode = '' })

    builder
      .addCase(resendResetOtp.pending,    (state)         => { state.resending = true })
      .addCase(resendResetOtp.fulfilled,  (state)         => { state.resending = false; state.cooldown = 60; state.kode = ''; state.resendMsg = 'OTP baru dikirim' })
      .addCase(resendResetOtp.rejected,   (state, action) => { state.resending = false; state.error = action.payload as string })

    builder
      .addCase(submitNewPassword.pending,   (state)       => { state.loading = true })
      .addCase(submitNewPassword.fulfilled, (state)       => { state.loading = false; state.step = 3; localStorage.removeItem('reset_token') })
      .addCase(submitNewPassword.rejected,  (state, action) => { state.loading = false; state.error = action.payload as string })
  },
})

// ─── EXPORTS ────────────────────────────────────────────
export const {
  setForgotEmail,
  setForgotKode,
  setNewPassword,
  setConfirmPassword,
  toggleShowPass,
  toggleShowConfirm,
  tickCooldown,
  resetForgot,
} = forgotPasswordSlice.actions

export default forgotPasswordSlice.reducer  // ← default export