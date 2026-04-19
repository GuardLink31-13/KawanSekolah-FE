// src/store/hooks.ts
//
// Hook bertipe — gunakan ini SELALU sebagai pengganti useDispatch & useSelector
// agar TypeScript tahu tipe state dan dispatch yang benar.
//
// Contoh pemakaian:
//   import { useAppDispatch, useAppSelector } from '../store/hooks'
//   const dispatch = useAppDispatch()
//   const step     = useAppSelector(state => state.register.step)

import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector<RootState, T>(selector)