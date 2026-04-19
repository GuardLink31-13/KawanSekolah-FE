// src/components/register/StepDone.tsx
//
// PERBAIKAN:
// - Props pakai Pick<FormData> dari registerSlice — tidak duplikasi tipe

import type { FormData } from '../../store/registerSlice'

interface Props {
  data: Pick<FormData, 'nama' | 'email' | 'role' | 'asalSekolah' | 'jenjangId' | 'matpel' | 'kelas'>
}


export default function StepDone({ data }: Props) {
  const summary = [
    { label: 'Email',   val: data.email },
    { label: 'Role',    val: data.role === 'guru' ? 'Guru' : 'Siswa' },
    { label: 'Sekolah', val: data.asalSekolah },
    { label: 'Jenjang', val: data.jenjangId },
    { label: 'Matpel',  val: data.matpel.join(', ') || '-' },
    { label: 'Kelas',   val: data.kelas.join(', ')  || '-' },
  ]

  return (
    <div className="flex flex-col items-center text-center py-4 animate-fadeIn">
      <div className="w-20 h-20 rounded-full bg-sage-pale flex items-center justify-center mb-5">
        <svg
          className="w-10 h-10 text-sage"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="font-display text-2xl text-sage mb-2">Pendaftaran Berhasil!</h2>
      <p className="text-sm text-ink-muted mb-6 leading-relaxed">
        Akun <strong className="text-ink">{data.nama}</strong> berhasil dibuat.<br />
        Silakan masuk untuk memulai.
      </p>

      <div className="w-full bg-cream-dark rounded-xl p-4 border border-cream-border text-left space-y-2">
        {summary.map(({ label, val }) => (
          <div key={label} className="flex justify-between text-xs">
            <span className="text-ink-muted">{label}</span>
            <span className="text-ink font-medium text-right max-w-[60%]">{val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}