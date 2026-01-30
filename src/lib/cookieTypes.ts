/**
 * Cookie Receipt 타입 정의
 */

export interface CookieInfo {
  name: string
  domain: string
  party_type: 'first_party' | 'third_party'
  purpose: 'advertising' | 'analytics' | 'functional' | 'necessary'
  duration: 'session' | 'persistent'
  expires_at?: string | null
}

export interface CookieReceipt {
  receipt_id: string
  created_at: string
  site_name: string
  site_url: string
  cookies: CookieInfo[]
  total_cookies: number
  first_party_count: number
  third_party_count: number
  advertising_count: number
  analytics_count: number
  functional_count: number
  session_count: number
  persistent_count: number
}

