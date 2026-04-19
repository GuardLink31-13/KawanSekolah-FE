// src/store/loginSlice.ts
//
// Flow: Login berhasil → saveToken → navigasi ke Dashboard langsung
// TIDAK ada OTP setelah login

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiLogin, saveToken } from '../Api'

interface LoginState {
  email:    string
  password: string
  loading:  boolean
  error:    string
  showPass: boolean
}

const initialState: LoginState = {
  email:    '',
  password: '',
  loading:  false,
  error:    '',
  showPass: false,
}

function validate(email: string, password: string): string | null {
  if (!email.trim())       return 'Email wajib diisi'
  if (!password.trim())    return 'Password wajib diisi'
  if (password.length < 8) return 'Password minimal 8 karakter'
  return null
}

export const submitLogin = createAsyncThunk(
  'login/submit',
  async (_, { getState, rejectWithValue }) => {
    const { email, password } = (getState() as { login: LoginState }).login

    const err = validate(email, password)
    if (err) return rejectWithValue(err)

    try {
      const res = await apiLogin({ email, password })
      if (res.token) saveToken(res.token)   // simpan token langsung
      return res
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Login gagal. Coba lagi.')
    }
  }
)

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload
      state.error = ''
    },
    setPassword(state, action: PayloadAction<string>) {
      state.password = action.payload
      state.error    = ''
    },
    toggleShowPass(state) {
      state.showPass = !state.showPass
    },
    resetLogin() {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitLogin.pending, (state) => {
        state.loading = true
        state.error   = ''
      })
      .addCase(submitLogin.fulfilled, (state) => {
        state.loading = false
        // navigasi ke Dashboard ditangani komponen via onSuccess()
      })
      .addCase(submitLogin.rejected, (state, action) => {
        state.loading  = false
        state.error    = (action.payload as string) ?? 'Login gagal'
        state.password = ''
      })
  },
})

export const { setEmail, setPassword, toggleShowPass, resetLogin } = loginSlice.actions
export default loginSlice.reducer