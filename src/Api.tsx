const BASE_URL = import.meta.env.VITE_API_BASE_URL
if (!BASE_URL) throw new Error('[Api] VITE_API_BASE_URL belum diset di .env')

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

// ✅ Tambah export agar bisa dipakai semua slice
export async function request<T>(
  path: string,
  body?: unknown,
  method: Method = 'POST',
  auth = false,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method, headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Tidak dapat terhubung ke server. Periksa koneksi Anda.')
  }
  let json: unknown
  try { json = await res.json() }
  catch { throw new Error(`Server error: ${res.status}`) }
  if (!res.ok) throw new Error((json as any)?.message ?? 'Terjadi kesalahan')
  return json as T
}

export const saveToken  = (token: string) => localStorage.setItem('token', token)
export const getToken   = ()              => localStorage.getItem('token')
export const clearToken = ()              => localStorage.removeItem('token')

export function apiVerifyOtp(payload: { email: string; kode: string }) {
  return request<any>('/auth/verify-otp', payload)
}
export function apiResendOtp(payload: { email: string }) {
  return request<any>('/auth/resend-otp', payload)
}
export function apiLogin(payload: { email: string; password: string }) {
  return request<any>('/auth/login', payload)
}
// ✅ Ganti tipe payload agar mata_pelajaran_id opsional
export function apiRegister(payload: {
  nama:               string
  email:              string
  password:           string
  asal_sekolah:       string
  jenjang_id:         number
  kelas_id:           number[]
  role:               string
  mata_pelajaran_id?: number[] 
  nidn?:              string    
}) {
  return request<any>('/auth/register', payload)
}