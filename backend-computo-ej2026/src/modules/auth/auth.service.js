import bcrypt from 'bcryptjs'
import { signAccessToken } from '../../config/jwt.js'
import { authRepository } from './auth.repository.js'
import { db } from '../../config/firebase.js'

export class AuthService {
  async login(payload) {
    const { usuario, password } = payload

    const user = await authRepository.findByUsuario(usuario)

    if (!user) {
      const error = new Error('Credenciales inválidas')
      error.statusCode = 401
      throw error
    }

    if (user.activo === false) {
      const error = new Error('Usuario inactivo')
      error.statusCode = 403
      throw error
    }

    const passwordHash = user.passwordHash || user.password

    if (!passwordHash) {
      const error = new Error('El usuario no tiene contraseña configurada')
      error.statusCode = 500
      throw error
    }

    const isValidPassword = await bcrypt.compare(password, passwordHash)

    if (!isValidPassword) {
      const error = new Error('Credenciales inválidas')
      error.statusCode = 401
      throw error
    }

    // Obtener permisos del rol si el usuario tiene roleId
    let userPermissions = Array.isArray(user.permissions) ? user.permissions : []
    
    if (user.roleId && userPermissions.length === 0) {
      try {
        const roleDoc = await db.collection('roles').doc(user.roleId).get()
        if (roleDoc.exists) {
          const roleData = roleDoc.data()
          userPermissions = Array.isArray(roleData.permissions) ? roleData.permissions : []
        }
      } catch (err) {
        console.error('Error obteniendo permisos del rol:', err)
      }
    }

    const token = signAccessToken({
      sub: user.id,
      usuario: user.usuario,
      role: user.role || null,
      roleId: user.roleId || null,
      permissions: userPermissions
    })

    return {
      token,
      user: this.sanitizeUser(user, userPermissions)
    }
  }

  async me(userId) {
    const user = await authRepository.findById(userId)

    if (!user) {
      const error = new Error('Usuario no encontrado')
      error.statusCode = 404
      throw error
    }

    if (user.activo === false) {
      const error = new Error('Usuario inactivo')
      error.statusCode = 403
      throw error
    }

    // Obtener permisos del rol si el usuario tiene roleId
    let userPermissions = Array.isArray(user.permissions) ? user.permissions : []
    
    if (user.roleId && userPermissions.length === 0) {
      try {
        const roleDoc = await db.collection('roles').doc(user.roleId).get()
        if (roleDoc.exists) {
          const roleData = roleDoc.data()
          userPermissions = Array.isArray(roleData.permissions) ? roleData.permissions : []
        }
      } catch (err) {
        console.error('Error obteniendo permisos del rol:', err)
      }
    }

    return this.sanitizeUser(user, userPermissions)
  }

  sanitizeUser(user, permissions = null) {
    return {
      id: user.id,
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      email: user.email || '',
      usuario: user.usuario || '',
      role: user.role || null,
      roleId: user.roleId || null,
      permissions: permissions !== null 
        ? permissions 
        : (Array.isArray(user.permissions) ? user.permissions : []),
      activo: user.activo ?? true
    }
  }
}

export const authService = new AuthService()