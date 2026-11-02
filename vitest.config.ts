// vitest.config.ts
import { defineConfig } from 'vitest/config'          // configuración de Vitest
import react from '@vitejs/plugin-react'              // para que entienda JSX/TSX (ya lo tenés instalado)

export default defineConfig({                         // exporta la configuración
  plugins: [react()],                                 // usa el plugin de React
  test: {                                             // opciones de los tests
    environment: 'jsdom',                             // simula un navegador (window, localStorage, document)
    include: ['src/**/*.test.{ts,tsx}'],              // corre solo los archivos que terminan en .test.ts(x)
  },
})