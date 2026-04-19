import { configureStore } from '@reduxjs/toolkit'
import registerReducer       from './registerSlice'
import otpReducer            from './otpSlice'
import kurikulumReducer      from './kurikulumSlice'
import loginReducer          from './loginSlice'
import forgotPasswordReducer from './forgotPasswordSlice'  // ✅ tanpa { }

export const store = configureStore({
  reducer: {
    register:       registerReducer,
    otp:            otpReducer,
    kurikulum:      kurikulumReducer,
    login:          loginReducer,
    forgotPassword: forgotPasswordReducer,  // ✅ langsung pakai, bukan .reducer
  },
})

export type RootState   = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch