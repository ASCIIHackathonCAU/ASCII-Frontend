import axios from 'axios'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

// 통합 백엔드 클라이언트
export const backend = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Backend-A API 클라이언트 (편의용)
export const backendA = axios.create({
  baseURL: `${BACKEND_URL}/api/a`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Backend-B API 클라이언트 (편의용)
export const backendB = axios.create({
  baseURL: `${BACKEND_URL}/api/b`,
  headers: {
    'Content-Type': 'application/json',
  },
})

