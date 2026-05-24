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

  async register(payload) {
  const { nombre, rfc, email, telefono, usuario, password } = payload  // ← rfc y telefono

  // ← quita el this.
  const existingUsuario = await authRepository.findByUsuario(usuario)
  if (existingUsuario) {
    const error = new Error('El nombre de usuario ya está en uso')
    error.statusCode = 409
    error.field = 'usuario'
    throw error
  }

  const emailSnapshot = await db
    .collection('users')
    .where('email', '==', email)
    .limit(1)
    .get()

  if (!emailSnapshot.empty) {
    const error = new Error('El email ya está registrado')
    error.statusCode = 409
    error.field = 'email'
    throw error
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const now = new Date().toISOString()
  const newUserRef = db.collection('users').doc()

  const userData = {
    nombre,
    rfc,        
    telefono,   
    email,
    usuario,
    passwordHash,
    role: 'CLIENTE',
    roleId: null,
    permissions: [],
    activo: true,
    createdAt: now,
    updatedAt: now,
  }

  await newUserRef.set(userData)

  const newUser = { id: newUserRef.id, ...userData }

  const token = signAccessToken({
    sub: newUser.id,
    usuario: newUser.usuario,
    role: newUser.role,
    roleId: newUser.roleId,
    permissions: newUser.permissions,
  })

  return {
    token,
    user: this.sanitizeUser(newUser, newUser.permissions),
  }
}
}

export const authService = new AuthService()