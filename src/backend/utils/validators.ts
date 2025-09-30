export function ensureStringField(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string.`)
  }

  const trimmed = value.trim()

  if (!trimmed) {
    throw new Error(`${fieldName} is required.`)
  }

  return trimmed
}

export function ensureOptionalStringField(
  value: unknown,
  fieldName: string,
): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string.`)
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return undefined
  }

  return trimmed
}

export function ensureEnumField<const T extends readonly string[]>(
  value: unknown,
  fieldName: string,
  allowedValues: T,
): T[number] {
  if (typeof value !== 'string') {
    throw new Error(
      `${fieldName} must be one of: ${allowedValues.join(', ')}.`,
    )
  }

  const normalized = value.trim()

  if (!allowedValues.includes(normalized as T[number])) {
    throw new Error(
      `${fieldName} must be one of: ${allowedValues.join(', ')}.`,
    )
  }

  return normalized as T[number]
}

export function ensureIsoDateField(
  value: unknown,
  fieldName: string,
): string
export function ensureIsoDateField(
  value: unknown,
  fieldName: string,
  options: { optional: true },
): string | undefined
export function ensureIsoDateField(
  value: unknown,
  fieldName: string,
  { optional = false }: { optional?: boolean } = {},
): string | undefined {
  if (value === undefined || value === null || value === '') {
    if (optional) {
      return undefined
    }

    throw new Error(`${fieldName} is required.`)
  }

  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string in ISO format.`)
  }

  const trimmed = value.trim()

  if (!trimmed) {
    if (optional) {
      return undefined
    }

    throw new Error(`${fieldName} is required.`)
  }

  const parsed = Date.parse(trimmed)

  if (Number.isNaN(parsed)) {
    throw new Error(`${fieldName} must be a valid ISO date string.`)
  }

  return new Date(parsed).toISOString()
}

export function ensureArrayField(
  value: unknown,
  fieldName: string,
): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array.`)
  }

  return value
}
