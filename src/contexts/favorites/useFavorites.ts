//src/contexts/favorites/useFavorites.ts
import { useContext } from 'react'                          // para abrir la caja
import { FavoritesContext } from './FavoritesContext'       // la caja

export function useFavorites() {                            // el hook de favoritos
  const context = useContext(FavoritesContext)              // abre la caja
  if (context === undefined) {                              // guard
    throw new Error('useFavorites debe usarse dentro de <FavoritesProvider>')
  }
  return context
}