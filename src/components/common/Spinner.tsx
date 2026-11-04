//src/components/common/Spinner.tsx
import './Spinner.css'                                                     // estilos del círculo

type SpinnerProps = { texto?: string }                                     // props tipadas (texto opcional)

export function Spinner({ texto = 'Cargando...' }: SpinnerProps) {         // si no le pasás texto, dice "Cargando..."
  return (
    <div className="spinner-contenedor" role="status" aria-live="polite">  {/* accesible para lectores de pantalla */}
      <span className="spinner" aria-hidden="true" />                     {/* el círculo que gira */}
      <p>{texto}</p>                                                       {/* el mensaje */}
    </div>
  )
}