import { createServerFn } from '@tanstack/react-start'
import { RegisterUserSchema } from '../schema/auth.schema'
import { api } from '../api'
import type { getUserResponse, LoginResponse, RegisterResponse, UserLoginInput } from '../api-types'
import { getCookie } from '@tanstack/react-start/server'

export const register = createServerFn({ method: 'POST' })
  .inputValidator((data) => RegisterUserSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const res = await api<UserLoginInput, RegisterResponse>('/auth/register', {
        data: data,
        method: 'POST',
      })
      return res.data.data
    } catch (error: unknown) {
      const err = error as Error
      throw new Error(err.message || 'Failed to register')
    }
  })

export const login = createServerFn({ method: 'POST' })
  .inputValidator((data) => RegisterUserSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const res = await api<UserLoginInput, LoginResponse>('/auth/login', {
        data: data,
        method: 'POST',
      })
      return res.data.data
    } catch (error: unknown) {
      const err = error as Error
      throw new Error(err.message || 'Failed to login')
    }
  })
export const getMe = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const token = getCookie('token')

    if (!token) {
      return null
    }

    const res = await api<null, getUserResponse>('/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return res.data.data
  } catch (error: unknown) {
    const err = error as Error
    throw new Error(err.message || 'Failed to get user')
  }
})
