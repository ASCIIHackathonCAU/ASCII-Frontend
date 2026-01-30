import { Receipt } from '@/lib/receiptTypes'

const STORAGE_KEY = 'receiptos.receipts'

const readStorage = (): Receipt[] => {
  if (typeof window === 'undefined') {
    return []
  }
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }
  try {
    return JSON.parse(raw) as Receipt[]
  } catch {
    return []
  }
}

const writeStorage = (receipts: Receipt[]) => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts))
}

export const getReceipts = () => readStorage()

export const getReceiptById = (id: string) =>
  readStorage().find((item) => item.id === id) ?? null

export const saveReceipt = (receipt: Receipt) => {
  const receipts = readStorage()
  writeStorage([receipt, ...receipts])
}

export const replaceReceipts = (receipts: Receipt[]) => {
  writeStorage(receipts)
}
