// src/store/registerSlice.ts


import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiRegister, saveToken } from '../Api'

export type Role = '' | 'guru' | 'murid'


export interface FormData {
  nama:        string
  email:       string
  password:    string
  role:        Role
  asalSekolah: string
  jenjangId:   number
  jenjangKode: string
  matpel:      number[]
  kelas:       number[]
  nidn:        string
}

interface RegisterState {
  formData: FormData
  step:     number
  error:    string
  loading:  boolean
}

export function validate(step: number, data: FormData): string | null {
  if (step === 0) {
    if (!data.nama.trim())        return 'Nama wajib diisi'
    if (!data.email.trim())       return 'Email wajib diisi'
    if (data.password.length < 8) return 'Password minimal 8 karakter'
    if (!data.role)               return 'Pilih role terlebih dahulu'
  }
  if (step === 1) {
    if (!data.asalSekolah.trim()) return 'Asal sekolah wajib diisi'
    if (!data.jenjangId)          return 'Pilih jenjang'
  }
  if (step === 2) {
  if (data.kelas.length === 0) return 'Pilih minimal 1 kelas'
  // ✅ Hanya guru yang wajib isi matpel dan nidn
  if (data.role === 'guru' && data.matpel.length === 0) return 'Pilih minimal 1 mata pelajaran'
  if (data.role === 'guru' && !data.nidn.trim())        return 'NIDN wajib diisi untuk guru'
}
  return null
}

export const submitRegister = createAsyncThunk(
  'register/submit',
  async (formData: FormData, { rejectWithValue }) => {
    const err = validate(2, formData)
    if (err) return rejectWithValue(err)
    if (!formData.role) return rejectWithValue('Pilih role terlebih dahulu')

    try {
      const payload: any = {
        nama:         formData.nama,
        email:        formData.email,
        password:     formData.password,
        asal_sekolah: formData.asalSekolah,
        jenjang_id:   formData.jenjangId,
        kelas_id:     formData.kelas,
        role:         formData.role,  // 'guru' atau 'murid'
      }

     
      if (formData.role === 'guru') {
        payload.mata_pelajaran_id = formData.matpel
        payload.nidn              = formData.nidn
      }

      const res = await apiRegister(payload)

      
      console.log('[Register Response]', res) // hapus setelah debug
      return res

    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Terjadi kesalahan.')
    }
  }
)

const INITIAL_FORM: FormData = {
  nama: '', email: '', password: '', role: '',
  asalSekolah: '', jenjangId: 0, jenjangKode: '',
  matpel: [], kelas: [], nidn: '',
}

const initialState: RegisterState = {
  formData: INITIAL_FORM,
  step: 0, error: '', loading: false,
}

const registerSlice = createSlice({
  name: 'register',
  initialState,
  reducers: {
    setField(state, action: PayloadAction<{ field: string; value: string | number | number[] }>) {
      const { field, value } = action.payload
      ;(state.formData as Record<string, unknown>)[field] = value
      state.error = ''
    },
    setJenjang(state, action: PayloadAction<{ id: number; kode: string }>) {
      state.formData.jenjangId   = action.payload.id
      state.formData.jenjangKode = action.payload.kode
      state.formData.matpel      = []
      state.formData.kelas       = []
      state.error = ''
    },
    toggleMatpel(state, action: PayloadAction<number>) {
      const id  = action.payload
      const idx = state.formData.matpel.indexOf(id)
      if (idx === -1) { state.formData.matpel.push(id) }
      else            { state.formData.matpel.splice(idx, 1) }
      state.error = ''
    },
    toggleKelas(state, action: PayloadAction<number>) {
      const id  = action.payload
      const idx = state.formData.kelas.indexOf(id)
      if (idx === -1) { state.formData.kelas.push(id) }
      else            { state.formData.kelas.splice(idx, 1) }
      state.formData.matpel = []  // reset matpel saat kelas berubah
      state.error = ''
    },
    goNext(state) {
      const err = validate(state.step, state.formData)
      if (err) { state.error = err; return }
      state.step += 1
      state.error = ''
    },
    goBack(state) {
      state.step -= 1
      state.error = ''
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload
    },
    resetRegister() {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitRegister.pending,   (state)         => { state.loading = true;  state.error = '' })
      .addCase(submitRegister.fulfilled, (state)         => { state.loading = false; state.step = 3 })
      .addCase(submitRegister.rejected,  (state, action) => { state.loading = false; state.error = (action.payload as string) ?? 'Terjadi kesalahan' })
  },
})

export const { setField, setJenjang, toggleMatpel, toggleKelas, goNext, goBack, setError, resetRegister } = registerSlice.actions
export default registerSlice.reducer