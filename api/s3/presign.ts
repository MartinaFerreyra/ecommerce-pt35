//api/s3/presign.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'      // tipos del pedido y la respuesta
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'       // la orden "subir a S3"
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'          // firma el permiso temporal
import { randomUUID } from 'node:crypto'                               // nombres únicos para cada foto
import { cert, getApps, initializeApp } from 'firebase-admin/app'      // conectar con Firebase Admin
import { getAuth } from 'firebase-admin/auth'                          // verificar quién es el usuario
import { getFirestore } from 'firebase-admin/firestore'                // leer su rol

const TIPOS_PERMITIDOS: Record<string, string> = {                     // solo imágenes
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const TAMANIO_MAXIMO = 5 * 1024 * 1024                                 // 5 MB

function getAdminApp() {                                               // conecta con Firebase Admin (una sola vez)
  const existente = getApps()[0]
  if (existente) return existente

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
  if (!projectId) throw new Error('Falta la variable FIREBASE_PROJECT_ID')
  if (!clientEmail) throw new Error('Falta la variable FIREBASE_CLIENT_EMAIL')
  if (!privateKey) throw new Error('Falta la variable FIREBASE_PRIVATE_KEY')

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n').replace(/^"|"$/g, ''), // "\n" → salto de línea, sin comillas sobrantes
    }),
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {                                       // solo acepta POST
      return res.status(405).json({ error: 'Método no permitido' })
    }

    const region = process.env.S3_REGION
    const bucket = process.env.S3_BUCKET
    if (!region || !bucket) throw new Error('Faltan las variables S3_REGION o S3_BUCKET')

    // CONTROL 1: ¿tiene sesión? → 401
    const header = req.headers.authorization ?? ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Falta iniciar sesión' })

    const app = getAdminApp()

    let uid: string
    try {
      uid = (await getAuth(app).verifyIdToken(token)).uid             // Firebase confirma que el token es real
    } catch {
      return res.status(401).json({ error: 'Sesión inválida o vencida' })
    }

    // CONTROL 2: ¿es admin? → 403
    const perfil = await getFirestore(app).collection('users').doc(uid).get()
    if (perfil.data()?.role !== 'admin') {
      return res.status(403).json({ error: 'Solo los administradores pueden subir imágenes' })
    }

    // CONTROL 3: ¿imagen válida? → 400
    const { contentType, size } = (req.body ?? {}) as { contentType?: string; size?: number }
    const extension = contentType ? TIPOS_PERMITIDOS[contentType] : undefined
    if (!extension) return res.status(400).json({ error: 'Solo se permiten imágenes JPG, PNG o WEBP' })
    if (typeof size !== 'number' || size <= 0 || size > TAMANIO_MAXIMO) {
      return res.status(400).json({ error: 'La imagen debe pesar hasta 5 MB' })
    }

    // Firma el permiso (60 segundos)
    const s3 = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
      },
    })
    const key = `products/${randomUUID()}.${extension}`                // ej: products/3f2a...c9.jpg
    const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType })
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 })
    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`

    return res.status(200).json({ uploadUrl, publicUrl })              // 200: acá tenés tu permiso
  } catch (err) {
    console.error('presign error:', err)                               // queda en los logs
    const detalle = err instanceof Error ? err.message : String(err)
    return res.status(500).json({ error: `Error del servidor: ${detalle}` })
  }
}