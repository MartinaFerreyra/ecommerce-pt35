//src/contexts/favorites/FavoritesContext.ts
import { createContext } from 'react'                       // para crear la caja
import type { Product } from '../../types/Product'         // joya

export type FavoritesContextValue = {                       // lo que ofrecen los favoritos
  favorites: Product[]                                      // las joyas favoritas
  favoritesCount: number                                    // cuántas hay
  isFavorite: (productId: string) => boolean                // ¿esta joya es favorita?
  toggleFavorite: (product: Product) => void                // marcar o desmarcar
  removeFavorite: (productId: string) => void               // sacar una
  clearFavorites: () => void                                // vaciar todos
}

export const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined) // la caja vacía