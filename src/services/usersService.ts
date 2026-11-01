//src/services/usersService.ts
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore'  // herramientas de Firestore
import { db } from './firebase'                                          // tu base de datos
import type { UserRole } from '../types/User'                            // 'customer' | 'admin'

export interface UserListItem {               // un usuario en la tabla del admin
  id: string                                  // uid de Firebase
  name: string                                // nombre
  email: string                               // email
  role: UserRole                              // rol
  createdAt?: Date                            // fecha de registro
}

export async function getAllUsers(): Promise<UserListItem[]> {          // todos los usuarios
  const snapshot = await getDocs(collection(db, 'users'))               // lee la colección "users"
  return snapshot.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        createdAt: data.createdAt?.toDate(),                            // Timestamp → Date
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))                       // ordenados por nombre
}

export async function updateUserRole(id: string, role: UserRole): Promise<void> { // cambia el rol
  await updateDoc(doc(db, 'users', id), { role })
}