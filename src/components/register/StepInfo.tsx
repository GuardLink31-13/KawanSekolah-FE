// src/components/register/StepInfo.tsx
//
// PERBAIKAN:
// - Props pakai Pick<FormData> dari registerSlice — tidak duplikasi tipe
// - onChange hanya string (field di step ini tidak butuh string[])

import type { FormData } from '../../store/registerSlice'

interface Props {
  data: Pick<FormData, 'nama' | 'email' | 'password' | 'role'>
  onChange: (field: string, value: string) => void
}

export default function StepInfo({ data, onChange }: Props) {
  return (
    <div className="space-y-4 animate-fadeIn">

      <div>
        <label className="field-label">Nama Lengkap</label>
        <input
          type="text"
          className="field"
          placeholder="Masukkan nama lengkap"
          value={data.nama}
          onChange={e => onChange('nama', e.target.value)}
        />
      </div>

      <div>
        <label className="field-label">Email</label>
        <input
          type="email"
          className="field"
          placeholder="contoh@email.com"
          value={data.email}
          onChange={e => onChange('email', e.target.value)}
        />
      </div>

      <div>
        <label className="field-label">Password</label>
        <input
          type="password"
          className="field"
          placeholder="Minimal 8 karakter"
          value={data.password}
          onChange={e => onChange('password', e.target.value)}
        />
      </div>

      <div>
  <label className="field-label">Role</label>
  <div className="grid grid-cols-2 gap-2">
    {(['guru', 'murid'] as const).map(r => (
      <button
        key={r}
        type="button"
        onClick={() => onChange('role', r)}
        className={`py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 capitalize
          ${data.role === r
            ? 'bg-sage text-white border-sage'
            : 'bg-white text-ink border-cream-border hover:border-sage/50'
          }`}
      >
        {r === 'guru' ? 'Guru' : 'Siswa'}
      </button>
    ))}
  </div>
</div>

    </div>
  )
}