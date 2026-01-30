type JSONSchema =
  | { type: 'string'; enum?: readonly string[] }
  | { type: 'number' }
  | { type: 'boolean' }
  | { type: 'null' }
  | { type: readonly ('string' | 'null')[] }
  | { type: 'array'; items: JSONSchema }
  | {
      type: 'object'
      properties: Record<string, JSONSchema>
      required?: readonly string[]
    }
  | { enum: readonly string[] }

type EnumValue<T extends readonly string[]> = T[number]

type SchemaValue<S extends JSONSchema> = S extends { enum: infer E }
  ? E extends readonly string[]
    ? EnumValue<E>
    : never
  : S extends { type: 'string' }
  ? string
  : S extends { type: 'number' }
  ? number
  : S extends { type: 'boolean' }
  ? boolean
  : S extends { type: 'null' }
  ? null
  : S extends { type: readonly ['string', 'null'] }
  ? string | null
  : S extends { type: 'array'; items: infer I }
  ? I extends JSONSchema
    ? SchemaValue<I>[]
    : never
  : S extends { type: 'object'; properties: infer P; required?: infer R }
  ? P extends Record<string, JSONSchema>
    ? {
        [K in keyof P as K extends string
          ? K
          : never]: K extends (R extends readonly string[] ? R[number] : never)
          ? SchemaValue<P[K]>
          : SchemaValue<P[K]> | undefined
      }
    : never
  : never

export type FromSchema<S> = S extends JSONSchema ? SchemaValue<S> : never
