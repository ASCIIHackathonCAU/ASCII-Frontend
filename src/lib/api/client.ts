import axios from 'axios'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

// Unified backend client
export const backend = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Backend-A API client (helper)
export const backendA = axios.create({
  baseURL: `${BACKEND_URL}/api/a`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Backend-B API client (helper)
export const backendB = axios.create({
  baseURL: `${BACKEND_URL}/api/b`,
  headers: {
    'Content-Type': 'application/json',
  },
})

