import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import serviceReducer from './serviceSlice'
import subscriptionReducer from './subscriptionSlice'
import paymentReducer from './paymentSlice'
import cookieManagementReducer from './cookieManagementSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    service: serviceReducer,
    subscription: subscriptionReducer,
    payment: paymentReducer,
    cookieManagement: cookieManagementReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
