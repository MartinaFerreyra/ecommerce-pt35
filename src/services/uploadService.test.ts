// src/services/uploadService.test.ts
// Prueba la subida de imágenes con Firebase Auth y fetch MOCKEADOS (no llama a Vercel ni a S3).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { uploadProductImage } from './uploadService'

const mocks = vi.hoisted(() => ({
  currentUser: null as null | { getIdToken: () => Promise<string> },     // usuario de Firebase falso
}))

vi.mock('./firebase', () => ({                                            // reemplaza src/services/firebase.ts
  auth: {
    get currentUser() { return mocks.currentUser },                       // se lee cada vez
  },
}))

const foto = new File(['contenido'], 'collar.jpg', { type: 'image/jpeg' }) // archivo de mentira

describe('uploadProductImage', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    mocks.currentUser = { getIdToken: async () => 'token-123' }          // hay sesión
    vi.stubGlobal('fetch', fetchMock)                                     // reemplaza fetch del navegador
    fetchMock.mockReset()
  })

  afterEach(() => vi.unstubAllGlobals())

  it('pide la URL firmada con el token y sube la foto a S3', async () => {
    fetchMock
      .mockResolvedValueOnce({                                            // 1° respuesta: /api/s3/presign
        ok: true,
        json: async () => ({ uploadUrl: 'https://s3-firmada', publicUrl: 'https://bucket/products/x.jpg' }),
      })
      .mockResolvedValueOnce({ ok: true })                                // 2° respuesta: PUT a S3

    const url = await uploadProductImage(foto)

    expect(url).toBe('https://bucket/products/x.jpg')                     // devuelve el link público
    const [ruta, opciones] = fetchMock.mock.calls[0]
    expect(ruta).toBe('/api/s3/presign')
    expect(opciones.headers.Authorization).toBe('Bearer token-123')       // mandó el token
    expect(JSON.parse(opciones.body)).toEqual({ contentType: 'image/jpeg', size: foto.size })
    expect(fetchMock.mock.calls[1][0]).toBe('https://s3-firmada')         // subió a la URL firmada
    expect(fetchMock.mock.calls[1][1].method).toBe('PUT')
  })

  it('sin sesión, no llama al backend (edge)', async () => {
    mocks.currentUser = null
    await expect(uploadProductImage(foto)).rejects.toThrow('Tenés que iniciar sesión.')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('si el backend responde 403, muestra su mensaje', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Solo los administradores pueden subir imágenes' }),
    })
    await expect(uploadProductImage(foto)).rejects.toThrow('Solo los administradores pueden subir imágenes')
  })

  it('si falla la subida a S3, avisa', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ uploadUrl: 'u', publicUrl: 'p' }) })
      .mockResolvedValueOnce({ ok: false })                               // S3 rechazó (ej: CORS)
    await expect(uploadProductImage(foto)).rejects.toThrow('No se pudo subir la imagen a S3.')
  })
})