import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { paymentApi } from '../utils/api'

interface Payment {
  id: number
  amount: number
  status: string
}

interface PaymentState {
  payments: Payment[]
  loading: boolean
  error: string | null
}

const initialState: PaymentState = {
  payments: [],
  loading: false,
  error: null,
}

export const createPayment = createAsyncThunk('payment/createPayment', async (data: any, { rejectWithValue }) => {
  try {
    const response = await paymentApi.createPayment(data)
    return response.data
  } catch (err: any) {
    return rejectWithValue('Failed to create payment')
  }
})

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createPayment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false
        state.payments.push(action.payload)
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default paymentSlice.reducer
