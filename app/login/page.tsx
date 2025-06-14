'use client'

import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '../../store/store'
import { login } from '../../store/authSlice'
import { RootState } from '../../store/store'

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>()
  const auth = useSelector((state: RootState) => state.auth)
  const [email, setemail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(login({ email, password }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {auth.error && <p className="text-red-500 mb-4">{auth.error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              email
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
          <button
            type="submit"
            disabled={auth.loading}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition"
          >
            {auth.loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
