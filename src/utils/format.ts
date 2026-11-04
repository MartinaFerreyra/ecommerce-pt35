//src/utils/format.ts
export function formatPrice(value: number): string {                    // 1500 → "$1.500"
  return `$${value.toLocaleString('es-AR')}`
}

export function formatDate(date?: Date): string {                        // Date → "3/11/26, 20:56"
  if (!date) return '—'
  return date.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
}