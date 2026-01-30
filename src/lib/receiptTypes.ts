import receiptSchemaJson from '@/receiptos-contracts/receipt.schema.json'
import { FromSchema } from '@/lib/schemaTypes'

const receiptSchema = receiptSchemaJson as const

export type Receipt = FromSchema<typeof receiptSchema>

export type Evidence = Receipt['evidence'][number]
