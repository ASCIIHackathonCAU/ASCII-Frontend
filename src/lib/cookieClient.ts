import { backend } from './api/client'
import { CookieReceipt, CookieInfo } from './cookieTypes'

const mockEnabled = process.env.NEXT_PUBLIC_MOCK === 'true'

/**
 * 백엔드 API를 통해 쿠키 영수증 목록을 가져옵니다.
 */
export const listCookieReceipts = async (): Promise<CookieReceipt[]> => {
  if (mockEnabled) {
    // Mock 모드에서는 localStorage 사용
    return getCookieReceiptsFromStorage()
  }

  try {
    const response = await backend.get<CookieReceipt[]>('/api/cookies')
    return response.data || []
  } catch (error) {
    console.error('Failed to fetch cookie receipts from backend:', error)
    // 백엔드 연결 실패 시 빈 배열 반환
    return []
  }
}

/**
 * 백엔드 API를 통해 쿠키 영수증을 생성합니다.
 */
export const createCookieReceipt = async (
  siteName: string,
  siteUrl: string,
  cookies: CookieInfo[]
): Promise<CookieReceipt> => {
  if (mockEnabled) {
    // Mock 모드에서는 간단한 로직 사용
    return createMockCookieReceipt(siteName, siteUrl, cookies)
  }

  try {
    const response = await backend.post<CookieReceipt>('/api/cookies', {
      site_name: siteName,
      site_url: siteUrl,
      cookies: cookies,
    })
    return response.data
  } catch (error: any) {
    console.error('Failed to create cookie receipt from backend:', error)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    } else if (error.request) {
      console.error('No response received. Backend may not be running.')
      throw new Error('백엔드 서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인하세요.')
    }
    throw error
  }
}

/**
 * 백엔드 API를 통해 쿠키 영수증을 조회합니다.
 */
export const getCookieReceipt = async (receiptId: string): Promise<CookieReceipt> => {
  if (mockEnabled) {
    const receipts = getCookieReceiptsFromStorage()
    const receipt = receipts.find((r) => r.receipt_id === receiptId)
    if (!receipt) {
      throw new Error('Cookie receipt not found')
    }
    return receipt
  }

  try {
    const response = await backend.get<CookieReceipt>(`/api/cookies/${receiptId}`)
    return response.data
  } catch (error: any) {
    console.error('Failed to get cookie receipt from backend:', error)
    throw error
  }
}

/**
 * 백엔드 API를 통해 쿠키 영수증을 삭제합니다.
 */
export const deleteCookieReceipt = async (receiptId: string): Promise<void> => {
  if (mockEnabled) {
    deleteCookieReceiptFromStorage(receiptId)
    return
  }

  try {
    await backend.delete(`/api/cookies/${receiptId}`)
  } catch (error: any) {
    console.error('Failed to delete cookie receipt from backend:', error)
    throw error
  }
}

// ============================================================================
// Mock 모드용 localStorage 함수들
// ============================================================================

function getCookieReceiptsFromStorage(): CookieReceipt[] {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem('receiptos.cookie_receipts')
  if (!raw) return []
  try {
    return JSON.parse(raw) as CookieReceipt[]
  } catch {
    return []
  }
}

function saveCookieReceiptToStorage(receipt: CookieReceipt): void {
  if (typeof window === 'undefined') return
  const receipts = getCookieReceiptsFromStorage()
  window.localStorage.setItem('receiptos.cookie_receipts', JSON.stringify([receipt, ...receipts]))
}

function deleteCookieReceiptFromStorage(receiptId: string): void {
  if (typeof window === 'undefined') return
  const receipts = getCookieReceiptsFromStorage()
  const filtered = receipts.filter((r) => r.receipt_id !== receiptId)
  window.localStorage.setItem('receiptos.cookie_receipts', JSON.stringify(filtered))
}

function createMockCookieReceipt(
  siteName: string,
  siteUrl: string,
  cookies: CookieInfo[]
): CookieReceipt {
  const createId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return `cookie-rcpt-${Date.now()}`
  }

  // 통계 계산
  const stats = {
    total_cookies: cookies.length,
    first_party_count: cookies.filter((c) => c.party_type === 'first_party').length,
    third_party_count: cookies.filter((c) => c.party_type === 'third_party').length,
    advertising_count: cookies.filter((c) => c.purpose === 'advertising').length,
    analytics_count: cookies.filter((c) => c.purpose === 'analytics').length,
    functional_count: cookies.filter((c) => c.purpose === 'functional').length,
    session_count: cookies.filter((c) => c.duration === 'session').length,
    persistent_count: cookies.filter((c) => c.duration === 'persistent').length,
  }

  const receipt: CookieReceipt = {
    receipt_id: createId(),
    created_at: new Date().toISOString(),
    site_name: siteName,
    site_url: siteUrl,
    cookies: cookies,
    ...stats,
  }

  saveCookieReceiptToStorage(receipt)
  return receipt
}

/**
 * 더미 쿠키 데이터 생성
 */
export const generateDummyCookieReceipts = (): CookieReceipt[] => {
  const dummySites = [
    {
      name: '네이버',
      url: 'https://www.naver.com',
      cookies: [
        { name: 'NID_AUT', domain: '.naver.com', party_type: 'first_party' as const, purpose: 'functional' as const, duration: 'persistent' as const },
        { name: 'NID_SES', domain: '.naver.com', party_type: 'first_party' as const, purpose: 'functional' as const, duration: 'session' as const },
        { name: '_ga', domain: '.google.com', party_type: 'third_party' as const, purpose: 'analytics' as const, duration: 'persistent' as const },
        { name: '_gid', domain: '.google.com', party_type: 'third_party' as const, purpose: 'analytics' as const, duration: 'persistent' as const },
      ],
    },
    {
      name: '카카오',
      url: 'https://www.kakao.com',
      cookies: [
        { name: 'kakao_id', domain: '.kakao.com', party_type: 'first_party' as const, purpose: 'functional' as const, duration: 'persistent' as const },
        { name: 'kakao_session', domain: '.kakao.com', party_type: 'first_party' as const, purpose: 'functional' as const, duration: 'session' as const },
        { name: 'ad_id', domain: '.doubleclick.net', party_type: 'third_party' as const, purpose: 'advertising' as const, duration: 'persistent' as const },
        { name: 'ad_click', domain: '.doubleclick.net', party_type: 'third_party' as const, purpose: 'advertising' as const, duration: 'session' as const },
      ],
    },
    {
      name: '쿠팡',
      url: 'https://www.coupang.com',
      cookies: [
        { name: 'coupang_id', domain: '.coupang.com', party_type: 'first_party' as const, purpose: 'functional' as const, duration: 'persistent' as const },
        { name: 'cart_session', domain: '.coupang.com', party_type: 'first_party' as const, purpose: 'functional' as const, duration: 'session' as const },
        { name: '_fbp', domain: '.facebook.com', party_type: 'third_party' as const, purpose: 'advertising' as const, duration: 'persistent' as const },
        { name: '_fbc', domain: '.facebook.com', party_type: 'third_party' as const, purpose: 'advertising' as const, duration: 'persistent' as const },
        { name: 'analytics_id', domain: '.google-analytics.com', party_type: 'third_party' as const, purpose: 'analytics' as const, duration: 'persistent' as const },
      ],
    },
  ]

  return dummySites.map((site) => {
    const stats = {
      total_cookies: site.cookies.length,
      first_party_count: site.cookies.filter((c) => c.party_type === 'first_party').length,
      third_party_count: site.cookies.filter((c) => c.party_type === 'third_party').length,
      advertising_count: site.cookies.filter((c) => c.purpose === 'advertising').length,
      analytics_count: site.cookies.filter((c) => c.purpose === 'analytics').length,
      functional_count: site.cookies.filter((c) => c.purpose === 'functional').length,
      session_count: site.cookies.filter((c) => c.duration === 'session').length,
      persistent_count: site.cookies.filter((c) => c.duration === 'persistent').length,
    }

    return {
      receipt_id: `cookie-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      site_name: site.name,
      site_url: site.url,
      cookies: site.cookies,
      ...stats,
    } as CookieReceipt
  })
}

