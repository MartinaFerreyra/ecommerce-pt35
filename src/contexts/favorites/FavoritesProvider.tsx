//src/contexts/favorites/FavoritesProvider.tsx
import { useCallback, useEffect, useMemo, useReducer } from 'react'      // herramientas de React
import type { ReactNode } from 'react'                                   // tipo de children
import type { Product } from '../../types/Product'                       // joya
import type { FavoritesState } from '../../types/Favorite'               // estado
import { useAuth } from '../auth/useAuth'                                // quién está logueado
import { favoritesReducer, initialFavoritesState } from './favoritesReducer' // las reglas
import { FavoritesContext } from './FavoritesContext'                    // la caja
import type { FavoritesContextValue } from './FavoritesContext'          // el contrato

function loadFromStorage(storageKey: string): FavoritesState {          // lee los favoritos guardados
  try {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return initialFavoritesState
    const parsed = JSON.parse(stored) as { items?: Product[] }
    return { items: parsed.items ?? [] }
  } catch {
    return initialFavoritesState
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) { // el encargado de favoritos
  const { user } = useAuth()                                             // quién está logueado
  const storageKey = `mlady-favorites:${user ? user.id : 'invitado'}`    // un cajón por usuario
  return (
    <UserFavorites key={storageKey} storageKey={storageKey}>
      {children}
    </UserFavorites>
  )
}

function UserFavorites({ storageKey, children }: { storageKey: string; children: ReactNode }) {
  const [state, dispatch] = useReducer(favoritesReducer, storageKey, loadFromStorage) // lee una sola vez

  useEffect(() => {                                                      // cada vez que cambian...
    localStorage.setItem(storageKey, JSON.stringify(state))              // ...los guarda
  }, [storageKey, state])

  const toggleFavorite = useCallback((product: Product) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: product })
  }, [])

  const removeFavorite = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_FAVORITE', payload: productId })
  }, [])

  const clearFavorites = useCallback(() => {
    dispatch({ type: 'CLEAR_FAVORITES' })
  }, [])

  const isFavorite = useCallback(                                        // ¿esta joya está en favoritos?
    (productId: string) => state.items.some((p) => p.id === productId),
    [state.items]
  )

  const value = useMemo<FavoritesContextValue>(() => ({
    favorites: state.items,
    favoritesCount: state.items.length,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    clearFavorites,
  }), [state.items, isFavorite, toggleFavorite, removeFavorite, clearFavorites])

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}