// src/components/register/StepSekolah.tsx
//
// PERUBAHAN:
// - Tidak lagi menerima props data/onChange — langsung pakai Redux
// - Jenjang diambil dari kurikulumSlice (API real), bukan array hardcode
// - Dispatch setJenjang({ id, kode }) saat pilih jenjang

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector }       from '../../store/hooks'
import { setField, setJenjang }                 from '../../store/registerSlice'
import { fetchKurikulum, selectJenjangList }    from '../../store/kurikulumSlice'

export default function StepSekolah() {
  const dispatch    = useAppDispatch()
  const asalSekolah = useAppSelector(s => s.register.formData.asalSekolah)
  const jenjangKode = useAppSelector(s => s.register.formData.jenjangKode)
  const jenjangList = useAppSelector(selectJenjangList)
  const loadingKur  = useAppSelector(s => s.kurikulum.loading)
  const errorKur    = useAppSelector(s => s.kurikulum.error)

  // Fetch kurikulum saat mount — hanya kalau belum ada di store
  useEffect(() => {
    if (jenjangList.length === 0) dispatch(fetchKurikulum())
  }, [dispatch, jenjangList.length])

  return (
    <div className="space-y-4 animate-fadeIn">

      {/* Input asal sekolah (free-text) */}
      <div>
        <label className="field-label">Asal Sekolah</label>
        <input
          type="text"
          className="field"
          placeholder="Nama sekolah Anda"
          value={asalSekolah}
          onChange={e => dispatch(setField({ field: 'asalSekolah', value: e.target.value }))}
        />
      </div>

      {/* Pilih jenjang dari API */}
      <div>
        <label className="field-label">Jenjang Sekolah</label>

        {loadingKur && (
          <div className="flex items-center gap-2 py-3 text-xs text-ink-muted">
            <span className="w-4 h-4 border-2 border-sage/30 border-t-sage rounded-full animate-spin" />
            Memuat data...
          </div>
        )}

        {errorKur && !loadingKur && (
  <div className="space-y-2">
    <p className="text-xs text-red-500 py-2">{errorKur}</p>
    <button
      type="button"
      onClick={() => dispatch(fetchKurikulum())}
      className="text-xs text-sage font-semibold hover:underline"
    >
      Coba lagi
    </button>
  </div>
)}

        {!loadingKur && !errorKur && (
          <div className="grid grid-cols-3 gap-2">
            {jenjangList.map(j => (
              <button
                key={j.ID}
                type="button"
                onClick={() => dispatch(setJenjang({ id: j.ID, kode: j.kode }))}
                className={`py-2.5 rounded-xl text-sm font-medium border transition-all duration-200
                  ${jenjangKode === j.kode
                    ? 'bg-sage text-white border-sage shadow-sm'
                    : 'bg-white text-ink border-cream-border hover:border-sage/50'
                  }`}
              >
                {j.kode}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info jenjang terpilih */}
      {jenjangKode && !loadingKur && (
        <div className="bg-sage-pale rounded-xl p-3 flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-sage-mid flex-shrink-0 mt-1" />
          <div>
            <p className="text-xs text-sage font-medium">
              {jenjangList.find(j => j.kode === jenjangKode)?.nama ?? jenjangKode} dipilih
            </p>
            <p className="text-xs text-sage/70 mt-0.5">
              Lanjut untuk memilih kelas dan mata pelajaran
            </p>
          </div>
        </div>
      )}

    </div>
  )
}