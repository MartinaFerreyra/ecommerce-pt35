//api/s3/presign.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'    // tipos del pedido y la respuesta
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'     // la orden "subir un archivo a S3"
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'        // firma el permiso temporal
import { randomUUID } from 'node:crypto'                             // nombres únicos para cada foto
import { adminAuth, adminDb } from '../_lib/firebaseAdmin'           // verificar usuario y rol

const TIPOS_PERMITIDOS: Record<string, string> = {                   // solo imágenes (tipo → extensión)
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const TAMANIO_MAXIMO = 5 * 1024 * 1024                               // 5 MB

const region = process.env.S3_REGION                                 // ej: us-east-1
const bucket = process.env.S3_BUCKET                                 // nombre del bucket

const s3 = new S3Client({                                            // cliente de S3 con las claves SECRETAS
  region,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
  },
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {                                       // solo acepta POST
    return res.status(405).json({ error: 'Método no permitido' })
  }

  // CONTROL 1: ¿tiene sesión? → si no, 401
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null // "Bearer abc123" → "abc123"
  if (!token) return res.status(401).json({ error: 'Falta iniciar sesión' })

  let uid: string
  try {
    uid = (await adminAuth.verifyIdToken(token)).uid                 // Firebase confirma que el token es real
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o vencida' })
  }

  // CONTROL 2: ¿es admin? → si no, 403
  const perfil = await adminDb.collection('users').doc(uid).get()    // lee users/{uid}
  if (perfil.data()?.role !== 'admin') {
    return res.status(403).json({ error: 'Solo los administradores pueden subir imágenes' })
  }

  // CONTROL 3: ¿es una imagen válida? → si no, 400
  const { contentType, size } = (req.body ?? {}) as { contentType?: string; size?: number }
  const extension = contentType ? TIPOS_PERMITIDOS[contentType] : undefined
  if (!extension) {
    return res.status(400).json({ error: 'Solo se permiten imágenes JPG, PNG o WEBP' })
  }
  if (typeof size !== 'number' || size <= 0 || size > TAMANIO_MAXIMO) {
    return res.status(400).json({ error: 'La imagen debe pesar hasta 5 MB' })
  }

  // Pasó los 3 controles: firma el permiso
  const key = `products/${randomUUID()}.${extension}`                // ej: products/3f2a...c9.jpg
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType })
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 }) // el permiso vence en 60 segundos
  const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}` // el link final de la foto

  return res.status(200).json({ uploadUrl, publicUrl })              // 200: acá tenés tu permiso
}