//src/pages/admin/ProductFormPage.tsx
import './ProductFormPage.css'                                            // estilos del formulario
import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'                       // 🆕 ChangeEvent: tipo del evento al elegir archivo
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createProduct, getProduct, updateProduct } from '../../services/adminProductsService'
import { uploadProductImage } from '../../services/uploadService'        // 🆕 sube la foto a S3
import type { ProductCategory } from '../../types/Product'

type FormValues = {                         // lo que se escribe en el formulario (todo como texto)
  name: string
  description: string
  price: string
  stock: string
  category: ProductCategory | ''
  imageUrl: string
}

type Campo = keyof FormValues               // 'name' | 'description' | ... (los nombres de los campos)
type Errores = Partial<Record<Campo, string>> // un mensaje de error por campo (opcional)

const VACIO: FormValues = { name: '', description: '', price: '', stock: '', category: '', imageUrl: '' }

// 1. LAS REGLAS: revisa todo y devuelve los errores
function validar(v: FormValues): Errores {
  const errores: Errores = {}

  if (v.name.trim().length < 3) errores.name = 'El nombre debe tener al menos 3 caracteres.'
  if (v.description.trim().length < 10) errores.description = 'La descripción debe tener al menos 10 caracteres.'

  const precio = Number(v.price)
  if (v.price === '') errores.price = 'El precio es obligatorio.'
  else if (Number.isNaN(precio) || precio <= 0) errores.price = 'El precio debe ser mayor a 0.'

  const stock = Number(v.stock)
  if (v.stock === '') errores.stock = 'El stock es obligatorio.'
  else if (!Number.isInteger(stock) || stock < 0) errores.stock = 'El stock debe ser un número entero, 0 o más.'

  if (!v.category) errores.category = 'Elegí una categoría.'

  if (!v.imageUrl.trim()) errores.imageUrl = 'Subí una imagen.'                // ✏️ ahora se sube, no se escribe
  else if (!v.imageUrl.startsWith('/') && !v.imageUrl.startsWith('http')) {
    errores.imageUrl = 'La imagen no es válida.'
  }

  return errores
}

export function ProductFormPage() {
  const { id } = useParams()                                              // si la URL tiene :id, estamos editando
  const esEdicion = Boolean(id)
  const navigate = useNavigate()

  const [values, setValues] = useState<FormValues>(VACIO)                 // lo escrito
  const [tocados, setTocados] = useState<Partial<Record<Campo, boolean>>>({}) // 2. qué campos ya se usaron
  const [cargando, setCargando] = useState(esEdicion)                      // cargando la joya a editar
  const [noEncontrado, setNoEncontrado] = useState(false)                  // si el id no existe
  const [guardando, setGuardando] = useState(false)                        // mientras guarda
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null)    // si falla Firestore
  const [subiendo, setSubiendo] = useState(false)                          // 🆕 mientras sube la foto a S3
  const [errorSubida, setErrorSubida] = useState<string | null>(null)      // 🆕 si falla la subida

  const errores = validar(values)                                         // se recalcula en CADA cambio → tiempo real
  const hayErrores = Object.keys(errores).length > 0

  useEffect(() => {                                                       // PREFILL: al editar, trae la joya
    if (!id) return
    let cancelado = false
    getProduct(id)
      .then((p) => {
        if (cancelado) return
        if (!p) { setNoEncontrado(true); return }                         // no existe
        setValues({                                                       // llena el formulario con sus datos
          name: p.name,
          description: p.description,
          price: String(p.price),                                         // número → texto para el input
          stock: String(p.stock),
          category: p.category,
          imageUrl: p.imageUrl ?? '',
        })
      })
      .catch(() => { if (!cancelado) setErrorGuardar('No se pudo cargar el producto.') })
      .finally(() => { if (!cancelado) setCargando(false) })
    return () => { cancelado = true }
  }, [id])

  const cambiar = (campo: Campo, valor: string) => {                      // al escribir
    setValues((prev) => ({ ...prev, [campo]: valor }))
  }

  const marcarTocado = (campo: Campo) => {                                // al salir del campo
    setTocados((prev) => ({ ...prev, [campo]: true }))
  }

  const errorDe = (campo: Campo) => (tocados[campo] ? errores[campo] : undefined) // muestra el error solo si se tocó

  const handleArchivo = async (e: ChangeEvent<HTMLInputElement>) => {     // 🆕 al elegir una foto
    const file = e.target.files?.[0]                                      // la foto elegida
    if (!file) return
    setErrorSubida(null)
    setSubiendo(true)
    try {
      const url = await uploadProductImage(file)                          // pide permiso y la sube a S3
      cambiar('imageUrl', url)                                            // guarda el link en el formulario
      marcarTocado('imageUrl')
    } catch (err) {
      setErrorSubida(err instanceof Error ? err.message : 'No se pudo subir la imagen.') // 401, 403, 400...
    } finally {
      setSubiendo(false)
      e.target.value = ''                                                 // permite volver a elegir el mismo archivo
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTocados({ name: true, description: true, price: true, stock: true, category: true, imageUrl: true }) // muestra todos los errores
    if (hayErrores || subiendo) return                                    // 3. con errores (o subiendo), no guarda

    setErrorGuardar(null)
    setGuardando(true)
    const data = {                                                        // texto → tipos reales para Firestore
      name: values.name.trim(),
      description: values.description.trim(),
      price: Number(values.price),
      stock: Number(values.stock),
      category: values.category as ProductCategory,
      imageUrl: values.imageUrl.trim(),                                   // el link de S3 se guarda en Firestore
    }
    try {
      if (id) await updateProduct(id, data)                               // editar
      else await createProduct(data)                                      // crear
      navigate('/admin/products')                                         // vuelve a la tabla
    } catch {
      setErrorGuardar('No se pudo guardar el producto. Intentá de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) return <p className="admin-estado">Cargando producto...</p>

  if (noEncontrado) {
    return (
      <div className="admin-estado">
        <p>Ese producto no existe.</p>
        <Link to="/admin/products">Volver a la lista</Link>
      </div>
    )
  }

  return (
    <form className="producto-form" onSubmit={handleSubmit} noValidate>    {/* noValidate: usamos NUESTRA validación */}
      <h2>{esEdicion ? '✏️ Editar producto' : '➕ Nuevo producto'}</h2>

      <label className={errorDe('name') ? 'campo con-error' : 'campo'}>
        Nombre
        <input
          value={values.name}
          onChange={(e) => cambiar('name', e.target.value)}
          onBlur={() => marcarTocado('name')}
        />
        {errorDe('name') && <span className="campo-error">{errorDe('name')}</span>}
      </label>

      <label className={errorDe('description') ? 'campo con-error' : 'campo'}>
        Descripción
        <textarea
          rows={3}
          value={values.description}
          onChange={(e) => cambiar('description', e.target.value)}
          onBlur={() => marcarTocado('description')}
        />
        {errorDe('description') && <span className="campo-error">{errorDe('description')}</span>}
      </label>

      <div className="form-fila">                                         {/* precio y stock lado a lado */}
        <label className={errorDe('price') ? 'campo con-error' : 'campo'}>
          Precio ($)
          <input
            type="number"
            min="0"
            value={values.price}
            onChange={(e) => cambiar('price', e.target.value)}
            onBlur={() => marcarTocado('price')}
          />
          {errorDe('price') && <span className="campo-error">{errorDe('price')}</span>}
        </label>

        <label className={errorDe('stock') ? 'campo con-error' : 'campo'}>
          Stock
          <input
            type="number"
            min="0"
            step="1"
            value={values.stock}
            onChange={(e) => cambiar('stock', e.target.value)}
            onBlur={() => marcarTocado('stock')}
          />
          {errorDe('stock') && <span className="campo-error">{errorDe('stock')}</span>}
        </label>
      </div>

      <label className={errorDe('category') ? 'campo con-error' : 'campo'}>
        Categoría
        <select
          value={values.category}
          onChange={(e) => cambiar('category', e.target.value)}
          onBlur={() => marcarTocado('category')}
        >
          <option value="">Elegí una categoría</option>
          <option value="collares">Collares</option>
          <option value="pulseras">Pulseras</option>
          <option value="anillos">Anillos</option>
        </select>
        {errorDe('category') && <span className="campo-error">{errorDe('category')}</span>}
      </label>

      {/* 🆕 IMAGEN: se elige un archivo y se sube a S3 */}
      <div className={errorDe('imageUrl') || errorSubida ? 'campo con-error' : 'campo'}>
        Imagen (JPG, PNG o WEBP, hasta 5 MB)
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"                         // solo deja elegir imágenes
          onChange={handleArchivo}
          disabled={subiendo}                                             // mientras sube, no deja elegir otra
        />
        {subiendo && <span className="campo-info">Subiendo imagen...</span>}
        {errorSubida && <span className="campo-error">{errorSubida}</span>}
        {errorDe('imageUrl') && !errorSubida && <span className="campo-error">{errorDe('imageUrl')}</span>}
      </div>

      {values.imageUrl && !errores.imageUrl && (                          // vista previa de la foto
        <img src={values.imageUrl} alt="Vista previa" className="form-preview" />
      )}

      {errorGuardar && <p className="admin-error">{errorGuardar}</p>}

      <div className="form-botones">
        <Link to="/admin/products" className="form-cancelar">Cancelar</Link>
        <button type="submit" className="admin-btn" disabled={guardando || subiendo}> {/* ✏️ tampoco mientras sube */}
          {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </div>
    </form>
  )
}