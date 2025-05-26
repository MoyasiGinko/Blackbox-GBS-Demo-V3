import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { serviceApi } from '../utils/api'

interface Service {
  id: number
  name: string
  description: string
}

interface UserService {
  id: number
  service: Service
  status: string
}

interface ServiceState {
  services: Service[]
  userServices: UserService[]
  loading: boolean
  error: string | null
}

const initialState: ServiceState = {
  services: [],
  userServices: [],
  loading: false,
  error: null,
}

export const fetchServices = createAsyncThunk('service/fetchServices', async (_, { rejectWithValue }) => {
  try {
    const response = await serviceApi.getServices()
    return response.data
  } catch (err: any) {
    return rejectWithValue('Failed to fetch services')
  }
})

export const fetchUserServices = createAsyncThunk('service/fetchUserServices', async (_, { rejectWithValue }) => {
  try {
    const response = await serviceApi.getUserServices()
    return response.data
  } catch (err: any) {
    return rejectWithValue('Failed to fetch user services')
  }
})

const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false
        state.services = action.payload
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchUserServices.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserServices.fulfilled, (state, action) => {
        state.loading = false
        state.userServices = action.payload
      })
      .addCase(fetchUserServices.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default serviceSlice.reducer
