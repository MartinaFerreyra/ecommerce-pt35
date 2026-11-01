//src/types/User.ts
export type UserRole = 'customer' | 'admin'                // roles posibles

export interface User {                                    // formulario del usuario
  id: string                                               // id de Firebase (uid)
  name: string                                             // nombre
  email: string                                            // email
  role: UserRole                                           // cliente o administrador
}