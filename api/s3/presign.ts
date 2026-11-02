//api/s3/presign.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'node:crypto'
import { getAdminAuth, getAdminDb } from '../_lib/firebaseAdmin.js'   // con .js

const TIPOS_PERMITIDOS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const TAMANIO_MAXIMO = 5 * 1024 * 1024                               // 5 MB

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {                                                              // 🆕 atrapa CUALQUIER error y lo muestra
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método no permitido' })
    }

    const region = process.env.S3_REGION
    const bucket = process.env.S3_BUCKET
    if (!region || !bucket) throw new Error('Faltan las variables S3_REGION o S3_BUCKET')

    // CONTROL 1: ¿tiene sesión? → 401
    const header = req.headers.authorization ?? ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Falta iniciar sesión' })

    let uid: string
    try {
      uid = (await getAdminAuth().verifyIdToken(token)).uid
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.startsWith('Falta la variable')) throw err             // si es por una variable, que se vea como 500
      return res.status(401).json({ error: 'Sesión inválida o vencida' })
    }

    // CONTROL 2: ¿es admin? → 403
    const perfil = await getAdminDb().collection('users').doc(uid).get()
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

    // Firma el permiso
    const s3 = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
      },
    })
    const key = `products/${randomUUID()}.${extension}`
    const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType })
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 })
    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`

    return res.status(200).json({ uploadUrl, publicUrl })
  } catch (err) {                                                    // 🆕 cualquier error inesperado
    console.error('presign error:', err)                             // queda en los Logs de Vercel
    const detalle = err instanceof Error ? err.message : String(err)
    return res.status(500).json({ error: `Error del servidor: ${detalle}` }) // y vuelve al navegador con el motivo
  }
}