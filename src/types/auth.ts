//src/types/auth.ts
import type { User } from './User';      // trae TU User desde user.ts (no lo redefinimos)

// El estado de la sesión: EN QUÉ SITUACIÓN está
export type AuthState = {
  status: "anonymous" | "authenticated";  // unión: sin sesión o con sesión
  user?: User;                             // opcional: solo existe si está logueado
};