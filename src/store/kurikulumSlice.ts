// src/store/kurikulumSlice.ts
//
// Menyimpan data kurikulum dari GET /api/kurikulum
// Data ini dipakai di StepSekolah (pilih jenjang) dan StepMatpel (pilih kelas & matpel)

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { request } from '../Api'  // ✅ pakai dari Api.tsx
// ─── Types dari shape API ──────────────────────────────────────────────────────

export interface MataPelajaran {
  ID:         number
  nama:       string
  kode:       string
  kategori:   'Wajib' | 'Pilihan'
  kelas_kode: string
  jenjang_id: number
}

export interface Kelas {
  ID:            number
  kode:          string
  nama:          string
  fase:          string
  jenjang_id:    number
  mata_pelajaran: MataPelajaran[]
}

export interface Jenjang {
  ID:    number
  kode:  string   // 'SD' | 'SMP' | 'SMA'
  nama:  string
  kelas: Kelas[]
}

interface KurikulumState {
  data:    Jenjang[]
  loading: boolean
  error:   string
}

const initialState: KurikulumState = {
  data:    [],
  loading: false,
  error:   '',
}

// ─── Async Thunk ──────────────────────────────────────────────────────────────

export const fetchKurikulum = createAsyncThunk(
  'kurikulum/fetch',
  async (_, { rejectWithValue }) => {
    try {
      // ✅ Pakai fetch langsung — TANPA melalui request() dari Api.tsx
      // karena endpoint ini public, tidak butuh BASE_URL dari env
      const res  = await fetch('https://kawan-sekolah.up.railway.app/api/kurikulum')
      const json = await res.json()

      console.log('[Kurikulum Response]', json) // hapus setelah debug

      if (!res.ok) throw new Error(json.message ?? 'Gagal memuat kurikulum')

      // Coba semua kemungkinan struktur
      const data = json?.data?.data ?? json?.data ?? json
      if (!Array.isArray(data)) throw new Error('Format response tidak dikenali')

      return data as Jenjang[]
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Gagal memuat kurikulum')
    }
  }
)
// ─── Slice ────────────────────────────────────────────────────────────────────

const kurikulumSlice = createSlice({
  name: 'kurikulum',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchKurikulum.pending, (state) => {
        state.loading = true
        state.error   = ''
      })
      .addCase(fetchKurikulum.fulfilled, (state, action) => {
        state.loading = false
        state.data    = action.payload
      })
      .addCase(fetchKurikulum.rejected, (state, action) => {
        state.loading = false
        state.error   = action.payload as string
      })
  },
})

export default kurikulumSlice.reducer

// ─── Selectors ────────────────────────────────────────────────────────────────

import type { RootState } from './store'

/** Ambil semua jenjang */
export const selectJenjangList = (state: RootState) => state.kurikulum.data

/** Ambil jenjang tertentu berdasarkan kode (SD/SMP/SMA) */
export const selectJenjang = (kode: string) => (state: RootState) =>
  state.kurikulum.data.find(j => j.kode === kode)

/** Ambil semua kelas dari jenjang tertentu */
export const selectKelasList = (jenjangKode: string) => (state: RootState) =>
  state.kurikulum.data.find(j => j.kode === jenjangKode)?.kelas ?? []

/**
 * Ambil mata pelajaran unik dari semua kelas yang dipilih.
 * Karena tiap kelas punya matpel sendiri, kita deduplikasi berdasarkan kode.
 * Ini dipakai di StepMatpel saat user sudah pilih beberapa kelas.
 */
export const selectMatpelForSelectedKelas = (
  jenjangKode: string,
  selectedKelasIds: number[]
) => (state: RootState): MataPelajaran[] => {
  const jenjang = state.kurikulum.data.find(j => j.kode === jenjangKode)
  if (!jenjang) return []

  const seen  = new Set<string>()
  const result: MataPelajaran[] = []

  for (const kelas of jenjang.kelas) {
    if (!selectedKelasIds.includes(kelas.ID)) continue
    for (const mp of kelas.mata_pelajaran) {
      if (!seen.has(mp.kode)) {
        seen.add(mp.kode)
        result.push(mp)
      }
    }
  }

  // Urutkan: Wajib dulu, lalu Pilihan
  return result.sort((a, b) => {
    if (a.kategori === b.kategori) return a.nama.localeCompare(b.nama)
    return a.kategori === 'Wajib' ? -1 : 1
  })
}