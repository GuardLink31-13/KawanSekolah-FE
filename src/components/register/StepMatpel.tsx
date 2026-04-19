// src/components/register/StepMatpel.tsx
//
// PERUBAHAN:
// - Tidak lagi menerima props — langsung baca/tulis Redux
// - Kelas & matpel dari API real (kurikulumSlice), bukan hardcode
// - TIDAK ADA batas maksimal matpel (guru maupun siswa)
// - Toggle kelas dulu → matpel muncul sesuai kelas yang dipilih
// - Badge Wajib/Pilihan dari field kategori API
// - Mata pelajaran dikelompokkan: Wajib dulu lalu Pilihan

import { useAppDispatch, useAppSelector }                from '../../store/hooks'
import { toggleMatpel, toggleKelas, setField }          from '../../store/registerSlice'
import { selectKelasList, selectMatpelForSelectedKelas } from '../../store/kurikulumSlice'

export default function StepMatpel() {
  const dispatch    = useAppDispatch()
  const role        = useAppSelector(s => s.register.formData.role)
  const jenjangKode = useAppSelector(s => s.register.formData.jenjangKode)
  const nidn        = useAppSelector(s => s.register.formData.nidn)
  const selectedKelasIds  = useAppSelector(s => s.register.formData.kelas)
  const selectedMatpelIds = useAppSelector(s => s.register.formData.matpel)

  const kelasList  = useAppSelector(selectKelasList(jenjangKode))
  const matpelList = useAppSelector(selectMatpelForSelectedKelas(jenjangKode, selectedKelasIds))

  const isGuru = role === 'guru'

  // Pisah matpel menjadi Wajib dan Pilihan untuk grouping UI
  const matpelWajib   = matpelList.filter(m => m.kategori === 'Wajib')
  const matpelPilihan = matpelList.filter(m => m.kategori === 'Pilihan')

  return (
    <div className="space-y-5 animate-fadeIn">

      {/* NIDN — hanya untuk guru */}
      {isGuru && (
        <div>
          <label className="field-label">
            NIDN
            <span className="ml-1 text-red-400 text-xs font-normal">*wajib</span>
          </label>
          <input
            type="text"
            className="field"
            placeholder="Nomor Induk Dosen Nasional"
            value={nidn}
            onChange={e => dispatch(setField({ field: 'nidn', value: e.target.value }))}
          />
        </div>
      )}

      {/* Pilih Kelas */}
      <div>
        <label className="field-label">
          {isGuru ? 'Kelas yang Diajar' : 'Kelas'}
          <span className="ml-1 text-ink-muted font-normal text-xs">
            (bisa pilih lebih dari satu)
          </span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {kelasList.map(k => {
            const selected = selectedKelasIds.includes(k.ID)
            return (
              <button
                key={k.ID}
                type="button"
                onClick={() => dispatch(toggleKelas(k.ID))}
                className={`py-2 rounded-xl text-xs font-medium border transition-all duration-200
                  ${selected
                    ? 'bg-sage-pale text-sage border-sage-mid'
                    : 'bg-white text-ink border-cream-border hover:border-sage/40'
                  }`}
              >
                {k.nama}
              </button>
            )
          })}
        </div>
      </div>

      {/* Mata Pelajaran — muncul setelah pilih kelas */}
      {selectedKelasIds.length > 0 && (
        <div className="space-y-3">
          <label className="field-label">
            Mata Pelajaran
            <span className="ml-1 text-ink-muted font-normal text-xs">
              (pilih semua yang relevan)
            </span>
          </label>

          {matpelList.length === 0 ? (
            <p className="text-xs text-ink-muted py-2">Memuat mata pelajaran...</p>
          ) : (
            <>
              {/* Grup Wajib */}
              {matpelWajib.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-wide mb-1.5">
                    Wajib
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {matpelWajib.map(mp => {
                      const selected = selectedMatpelIds.includes(mp.ID)
                      return (
                        <button
                          key={mp.ID}
                          type="button"
                          onClick={() => dispatch(toggleMatpel(mp.ID))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200
                            ${selected
                              ? 'bg-sage text-white border-sage'
                              : 'bg-white text-ink border-cream-border hover:border-sage/50'
                            }`}
                        >
                          {mp.nama}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Grup Pilihan */}
              {matpelPilihan.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-wide mb-1.5">
                    Pilihan
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {matpelPilihan.map(mp => {
                      const selected = selectedMatpelIds.includes(mp.ID)
                      return (
                        <button
                          key={mp.ID}
                          type="button"
                          onClick={() => dispatch(toggleMatpel(mp.ID))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200
                            ${selected
                              ? 'bg-gold/80 text-sage border-gold'
                              : 'bg-white text-ink border-cream-border hover:border-gold/50'
                            }`}
                        >
                          {mp.nama}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Preview ringkasan pilihan */}
      {(selectedKelasIds.length > 0 || selectedMatpelIds.length > 0) && (
        <div className="bg-cream-dark rounded-xl p-3 space-y-1.5 border border-cream-border">
          {selectedKelasIds.length > 0 && (
            <p className="text-xs text-ink">
              <span className="text-ink-muted">Kelas: </span>
              {kelasList
                .filter(k => selectedKelasIds.includes(k.ID))
                .map(k => k.nama)
                .join(', ')
              }
            </p>
          )}
          {selectedMatpelIds.length > 0 && (
            <p className="text-xs text-ink">
              <span className="text-ink-muted">Matpel ({selectedMatpelIds.length}): </span>
              {matpelList
                .filter(m => selectedMatpelIds.includes(m.ID))
                .map(m => m.nama)
                .join(', ')
              }
            </p>
          )}
        </div>
      )}

    </div>
  )
}