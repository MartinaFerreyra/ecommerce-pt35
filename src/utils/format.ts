//src/utils/format.ts
export function formatPrice(value: number): string {                    // 1500 → "$1.500"
  return `$${value.toLocaleString('es-AR')}`                             // formato argentino
}

export function formatDate(date?: Date): string {                        // Date → "3/11/26, 19:43"
  if (!date) return '—'                                                  // si todavía no tiene fecha
  return date.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
}