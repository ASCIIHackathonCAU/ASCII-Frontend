// 백엔드 API 타입 정의

export interface IngestRequest {
  raw_text: string
  source_type?: string
  metadata?: Record<string, any>
}

export interface IngestResponse {
  receipt: any // Backend Receipt schema
  extract_result: any // Backend ExtractResult schema
}

