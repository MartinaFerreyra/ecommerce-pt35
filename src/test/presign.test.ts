// @vitest-environment node
// src/test/presign.test.ts
// Prueba la Serverless Function api/s3/presign.ts con Firebase Admin y AWS SDK MOCKEADOS.
// (Está en src/test y no en api/ para que Vercel no lo publique como una función más.)
import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '../../api/s3/presign'

// ---------- MOCKS ----------
const mocks = vi.hoisted(() => ({
  verifyIdToken: vi.fn(),                                                 // Firebase Admin: valida el token
  role: 'admin' as string | undefined,                                    // rol guardado en users/{uid}
  getSignedUrl: vi.fn(),                                                  // AWS: firma la URL
}))

vi.mock('firebase-admin/app', () => ({
  getApps: () => [{}],                                                    // "ya está inicializado"
  initializeApp: vi.fn(),
  cert: vi.fn(),
}))

vi.mock('firebase-admin/auth', () => ({
  getAuth: () => ({ verifyIdToken: mocks.verifyIdToken }),
}))

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => ({
    collection: () => ({
      doc: () => ({
        get: async () => ({ data: () => (mocks.role ? { role: mocks.role } : undefined) }),
      }),
    }),
  }),
}))

vi.mock('@aws-sdk/client-s3', () => ({                                    // AWS SDK falso
  S3Client: class {},
  PutObjectCommand: class {
    input: unknown
    constructor(input: unknown) { this.input = input }
  },
}))

vi.mock('@aws-sdk/s3-request-presigner', () => ({ getSignedUrl: mocks.getSignedUrl }))

// ---------- AYUDANTES ----------
function crearRes() {                                                     // respuesta de mentira
  return {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) { this.statusCode = code; return this },
    json(data: unknown) { this.body = data; return this },
  }
}

function crearReq(opciones: { method?: string; token?: string; body?: unknown }) { // pedido de mentira
  return {
    method: opciones.method ?? 'POST',
    headers: opciones.token ? { authorization: `Bearer ${opciones.token}` } : {},
    body: opciones.body,
  }
}

async function llamar(req: ReturnType<typeof crearReq>) {
  const res = crearRes()
  await handler(req as never, res as never)                               // ejecuta la función
  return res
}

const fotoValida = { contentType: 'image/jpeg', size: 100_000 }           // 100 KB

describe('POST /api/s3/presign', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.S3_REGION = 'us-east-1'
    process.env.S3_BUCKET = 'bucket-test'
    mocks.role = 'admin'
    mocks.verifyIdToken.mockResolvedValue({ uid: 'uid-admin' })
    mocks.getSignedUrl.mockResolvedValue('https://url-firmada')
  })

  it('405 si no es POST', async () => {
    const res = await llamar(crearReq({ method: 'GET' }))
    expect(res.statusCode).toBe(405)
  })

  it('401 sin token', async () => {
    const res = await llamar(crearReq({ body: fotoValida }))
    expect(res.statusCode).toBe(401)
  })

  it('401 con token inválido', async () => {
    mocks.verifyIdToken.mockRejectedValue(new Error('token vencido'))
    const res = await llamar(crearReq({ token: 'malo', body: fotoValida }))
    expect(res.statusCode).toBe(401)
  })

  it('403 si no es admin', async () => {
    mocks.role = 'customer'
    const res = await llamar(crearReq({ token: 'ok', body: fotoValida }))
    expect(res.statusCode).toBe(403)
    expect(mocks.getSignedUrl).not.toHaveBeenCalled()                     // no firmó nada
  })

  it('400 si el archivo no es una imagen permitida (edge)', async () => {
    const res = await llamar(crearReq({ token: 'ok', body: { contentType: 'image/gif', size: 1000 } }))
    expect(res.statusCode).toBe(400)
  })

  it('400 si pesa más de 5 MB (edge)', async () => {
    const res = await llamar(crearReq({ token: 'ok', body: { contentType: 'image/png', size: 6 * 1024 * 1024 } }))
    expect(res.statusCode).toBe(400)
  })

  it('200 para un admin: devuelve uploadUrl y publicUrl, y la URL vence en 60 s', async () => {
    const res = await llamar(crearReq({ token: 'ok', body: fotoValida }))
    expect(res.statusCode).toBe(200)
    const body = res.body as { uploadUrl: string; publicUrl: string }
    expect(body.uploadUrl).toBe('https://url-firmada')
    expect(body.publicUrl).toMatch(/^https:\/\/bucket-test\.s3\.us-east-1\.amazonaws\.com\/products\/.+\.jpg$/)
    expect(mocks.getSignedUrl.mock.calls[0][2]).toEqual({ expiresIn: 60 })
  })
})