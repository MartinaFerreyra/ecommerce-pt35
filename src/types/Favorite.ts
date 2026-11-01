//src/types/Favorite.ts
import type { Product } from './Product'                    // formulario de la joya

export type FavoritesState = {                              // el estado de favoritos
  items: Product[]                                          // las joyas marcadas con ♥
}

export type FavoritesAction =                               // las acciones posibles
  | { type: 'TOGGLE_FAVORITE'; payload: Product }           // marcar o desmarcar una joya
  | { type: 'REMOVE_FAVORITE'; payload: string }            // sacar la joya con este id
  | { type: 'CLEAR_FAVORITES' }                             // vaciar todos