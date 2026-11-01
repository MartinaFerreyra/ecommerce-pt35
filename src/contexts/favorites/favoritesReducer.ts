//src/contexts/favorites/favoritesReducer.ts
import type { FavoritesState, FavoritesAction } from '../../types/Favorite' // contratos

export const initialFavoritesState: FavoritesState = { items: [] }          // sin favoritos

export function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {

    case 'TOGGLE_FAVORITE': {                                               // tocar el corazón
      const existe = state.items.some((p) => p.id === action.payload.id)    // ¿ya estaba?
      return {
        items: existe
          ? state.items.filter((p) => p.id !== action.payload.id)           // si estaba → la saca
          : [...state.items, action.payload],                               // si no → la agrega
      }
    }

    case 'REMOVE_FAVORITE':                                                 // sacar una
      return { items: state.items.filter((p) => p.id !== action.payload) }

    case 'CLEAR_FAVORITES':                                                 // vaciar todos
      return initialFavoritesState

    default:
      return state
  }
}