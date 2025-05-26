import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cookieManagementApi } from '../utils/api'

interface LoginService {
  id: number
  name: string
  description: string
}

interface Cookie {
  id: string
  status: string
  expires_at: string
}

interface CookieManagementState {
  loginServices: LoginService[]
  cookies: Cookie[]
  loading: boolean
  error: string | null
}

const initialState: CookieManagementState = {
  loginServices: [],
  cookies: [],
  loading: false,
  error: null,
}

export const addLoginService = createAsyncThunk(
  'cookieManagement/addLoginService',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await cookieManagementApi.addLoginService(data)
      return response.data
    } catch (err: any) {
      return rejectWithValue('Failed to add login service')
    }
  }
)

export const getCookieData = createAsyncThunk(
  'cookieManagement/getCookieData',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await cookieManagementApi.getCookieData(id)
      return response.data
    } catch (err: any) {
      return rejectWithValue('Failed to get cookie data')
    }
  }
)

const cookieManagementSlice = createSlice({
  name: 'cookieManagement',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addLoginService.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addLoginService.fulfilled, (state, action) => {
        state.loading = false
        state.loginServices.push(action.payload)
      })
      .addCase(addLoginService.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(getCookieData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCookieData.fulfilled, (state, action) => {
        state.loading = false
        state.cookies.push(action.payload)
      })
      .addCase(getCookieData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default cookieManagementSlice.reducer
