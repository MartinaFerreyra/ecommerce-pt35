// src/test/setup.ts
// Se ejecuta antes de los tests: después de CADA test, limpia la pantalla de mentira.
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()                                       // desmonta lo que dibujó el test anterior
  if (typeof localStorage !== 'undefined') {      // solo existe en los tests de navegador (jsdom),
    localStorage.clear()                          // no en el de la función de Vercel (node)
  }
})