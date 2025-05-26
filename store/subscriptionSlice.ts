import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { subscriptionApi } from '../utils/api'

interface SubscriptionPlan {
  id: number
  name: string
  price: number
  duration_days: number
}

interface SubscriptionState {
  plans: SubscriptionPlan[]
  loading: boolean
  error: string | null
}

const initialState: SubscriptionState = {
  plans: [],
  loading: false,
  error: null,
}

export const fetchSubscriptions = createAsyncThunk('subscription/fetchSubscriptions', async (_, { rejectWithValue }) => {
  try {
    const response = await subscriptionApi.getSubscriptions()
    return response.data
  } catch (err: any) {
    return rejectWithValue('Failed to fetch subscriptions')
  }
})

export const purchaseSubscription = createAsyncThunk(
  'subscription/purchaseSubscription',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.purchaseSubscription(data)
      return response.data
    } catch (err: any) {
      return rejectWithValue('Failed to purchase subscription')
    }
  }
)

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false
        state.plans = action.payload
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(purchaseSubscription.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(purchaseSubscription.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(purchaseSubscription.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default subscriptionSlice.reducer
