//src/services/uploadService.ts
import { auth } from './firebase'                          // para saber quién está logueado

export async function uploadProductImage(file: File): Promise<string> { // sube la foto y devuelve su link
  const user = auth.currentUser                            // el usuario de Firebase
  if (!user) throw new Error('Tenés que iniciar sesión.')

  const token = await user.getIdToken()                    // el "carnet" que prueba quién sos

  // 1. Pedir permiso a la Serverless Function
  const respuesta = await fetch('/api/s3/presign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,                    // la función lo verifica (401 / 403)
    },
    body: JSON.stringify({ contentType: file.type, size: file.size }), // tipo y peso de la foto
  })

  if (!respuesta.ok) {                                     // 400, 401 o 403
    const datos = await respuesta.json().catch(() => ({}))
    throw new Error(datos.error ?? 'No se pudo obtener permiso para subir la imagen.')
  }

  const { uploadUrl, publicUrl } = await respuesta.json()  // el permiso y el link final

  // 2. Subir la foto DIRECTO a S3 con ese permiso
  const subida = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },                // tiene que coincidir con lo que firmó la función
    body: file,                                            // la foto
  })

  if (!subida.ok) throw new Error('No se pudo subir la imagen a S3.')

  return publicUrl                                         // 3. este link se guarda como imageUrl en Firestore
}