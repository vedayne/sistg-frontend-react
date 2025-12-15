/**
 * CONFIGURACIÓN DE PERMISOS POR ID DE ROL
 *
 * Este archivo define qué páginas puede acceder cada rol según su ID.
 *
 * INSTRUCCIONES PARA MODIFICAR:
 * 1. Busca el ID del rol que quieres modificar en ROLE_PERMISSIONS
 * 2. Agrega o quita los IDs de las páginas a las que ese rol puede acceder
 * 3. Los IDs de páginas disponibles están listados en PAGE_IDS
 * 4. Si un usuario tiene múltiples roles, tendrá acceso a TODAS las páginas
 *    de todos sus roles combinados (sin duplicados)
 *
 * NOTA: Los IDs de roles vienen desde la base de datos y pueden variar.
 * Asegúrate de verificar los IDs correctos desde la API antes de modificar.
 */

// ============================================================================
// DEFINICIÓN DE TODAS LAS PÁGINAS DISPONIBLES
// ============================================================================

export const PAGE_IDS = {
  PERFIL: "perfil",
  LISTADO_USUARIO: "listado-usuario",
  ASIGNACION_ROLES: "asignacion-roles",
  ESTUDIANTES: "estudiantes",
  REGISTRO_TEMARIO: "registro-temario",
  PROYECTOS: "proyectos",
  ENTREGAS: "entregas",
  DOCUMENTACION: "documentacion",
  NOMBRAMIENTO_TUTOR: "nombramiento-tutor",
  CONFIGURACIONES: "configuraciones",
  DEFENSAS: "defensas",
  REPORTE: "reporte",
  MANUAL: "manual",
  FLUJOGRAMA: "flujograma",
} as const

// ============================================================================
// MAPEO DE ID DE ROL -> PÁGINAS PERMITIDAS
// ============================================================================

/**
 * Configuración de permisos por ID de rol.
 *
 * ACTUALIZADO CON IDS REALES DEL BACKEND (2025-12-14)
 *
 * ESTRUCTURA:
 * [roleId]: [array de pageIds que puede acceder]
 *
 * ROLES DISPONIBLES EN EL BACKEND:
 * - ID 1: ADMIN - Administrador del sistema con acceso completo
 * - ID 2: DOCENTETG - Docente de Trabajos de Grado
 * - ID 3: ESTUDIANTE - Estudiante de la institución
 * - ID 4: TUTOR - Tutor de Trabajos de Grado
 * - ID 5: REVISOR - Revisor de Trabajos de Grado
 * - ID 6: JEFECARRERA - Jefe de carrera de la institución
 * - ID 7: DDE - Docente de Dedicación Exclusiva
 * - ID 8: SECRETARIA - Secretaría de carrera
 * - ID 9: INVITADO - Usuario invitado
 */
export const ROLE_PERMISSIONS: Record<number, string[]> = {
  // ====================================
  // ID 1 - ADMIN
  // ====================================
  1: [
    PAGE_IDS.PERFIL,
    PAGE_IDS.LISTADO_USUARIO,
    PAGE_IDS.ASIGNACION_ROLES,
    PAGE_IDS.ESTUDIANTES,
    PAGE_IDS.REGISTRO_TEMARIO,
    PAGE_IDS.PROYECTOS,
    PAGE_IDS.ENTREGAS,
    PAGE_IDS.DOCUMENTACION,
    PAGE_IDS.NOMBRAMIENTO_TUTOR,
    PAGE_IDS.CONFIGURACIONES,
    PAGE_IDS.DEFENSAS,
    PAGE_IDS.REPORTE,
    PAGE_IDS.MANUAL,
    PAGE_IDS.FLUJOGRAMA,
  ],

  // ====================================
  // ID 2 - DOCENTETG
  // ====================================
  2: [
    PAGE_IDS.PERFIL,
    PAGE_IDS.LISTADO_USUARIO,
    PAGE_IDS.ESTUDIANTES,
    PAGE_IDS.REGISTRO_TEMARIO,
    PAGE_IDS.PROYECTOS,
    PAGE_IDS.ENTREGAS,
    PAGE_IDS.DOCUMENTACION,
    PAGE_IDS.DEFENSAS,
    PAGE_IDS.MANUAL,
    PAGE_IDS.FLUJOGRAMA,
  ],

  // ====================================
  // ID 3 - ESTUDIANTE
  // ====================================
  3: [
    PAGE_IDS.PERFIL,
    PAGE_IDS.REGISTRO_TEMARIO,
    PAGE_IDS.PROYECTOS,
    PAGE_IDS.ENTREGAS,
    PAGE_IDS.DOCUMENTACION,
    PAGE_IDS.NOMBRAMIENTO_TUTOR,
    PAGE_IDS.DEFENSAS,
    PAGE_IDS.MANUAL,
    PAGE_IDS.FLUJOGRAMA,
  ],

  // ====================================
  // ID 4 - TUTOR
  // ====================================
  4: [
    PAGE_IDS.PERFIL,
    PAGE_IDS.ESTUDIANTES,
    PAGE_IDS.PROYECTOS,
    PAGE_IDS.ENTREGAS,
    PAGE_IDS.DEFENSAS,
    PAGE_IDS.MANUAL,
    PAGE_IDS.FLUJOGRAMA,
  ],

  // ====================================
  // ID 5 - REVISOR
  // Nota: También se usa para REVISOR1 y REVISOR2
  // ====================================
  5: [
    PAGE_IDS.PERFIL,
    PAGE_IDS.ESTUDIANTES,
    PAGE_IDS.PROYECTOS,
    PAGE_IDS.ENTREGAS,
    PAGE_IDS.DEFENSAS,
    PAGE_IDS.MANUAL,
    PAGE_IDS.FLUJOGRAMA,
  ],

  // ====================================
  // ID 6 - JEFECARRERA
  // ====================================
  6: [
    PAGE_IDS.PERFIL,
    PAGE_IDS.LISTADO_USUARIO,
    PAGE_IDS.ESTUDIANTES,
    PAGE_IDS.PROYECTOS,
    PAGE_IDS.DEFENSAS,
    PAGE_IDS.MANUAL,
    PAGE_IDS.FLUJOGRAMA,
  ],

  // ====================================
  // ID 7 - DDE
  // ====================================
  7: [
    PAGE_IDS.PERFIL,
    PAGE_IDS.LISTADO_USUARIO,
    PAGE_IDS.ESTUDIANTES,
    PAGE_IDS.PROYECTOS,
    PAGE_IDS.DEFENSAS,
    PAGE_IDS.MANUAL,
    PAGE_IDS.FLUJOGRAMA,
  ],

  // ====================================
  // ID 8 - SECRETARIA
  // ====================================
  8: [
    PAGE_IDS.PERFIL,
    PAGE_IDS.ESTUDIANTES,
    PAGE_IDS.PROYECTOS,
    PAGE_IDS.DOCUMENTACION,
    PAGE_IDS.MANUAL,
    PAGE_IDS.FLUJOGRAMA,
  ],

  // ====================================
  // ID 9 - INVITADO
  // ====================================
  9: [
    PAGE_IDS.PERFIL,
    PAGE_IDS.MANUAL,
    PAGE_IDS.FLUJOGRAMA,
  ],
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Obtiene todas las páginas permitidas para un conjunto de roles.
 * Si un usuario tiene múltiples roles, combina todos los permisos.
 *
 * @param roleIds - Array de IDs de roles del usuario
 * @returns Array de IDs de páginas únicas a las que el usuario tiene acceso
 */
export function getAllowedPageIds(roleIds: number[]): string[] {
  // Usamos un Set para evitar duplicados
  const allowedPages = new Set<string>()

  // Iteramos sobre cada rol del usuario
  roleIds.forEach(roleId => {
    // Obtenemos las páginas permitidas para este rol
    const pagesForRole = ROLE_PERMISSIONS[roleId] || []

    // Agregamos cada página al Set (automáticamente elimina duplicados)
    pagesForRole.forEach(pageId => allowedPages.add(pageId))
  })

  // Convertimos el Set de vuelta a un array
  return Array.from(allowedPages)
}

/**
 * Verifica si un conjunto de roles tiene acceso a una página específica.
 *
 * @param pageId - ID de la página a verificar
 * @param roleIds - Array de IDs de roles del usuario
 * @returns true si al menos uno de los roles tiene acceso a la página
 */
export function hasAccessToPage(pageId: string, roleIds: number[]): boolean {
  // Verificamos si alguno de los roles del usuario tiene acceso a esta página
  return roleIds.some(roleId => {
    const allowedPages = ROLE_PERMISSIONS[roleId] || []
    return allowedPages.includes(pageId)
  })
}

/**
 * Obtiene información de debug sobre los permisos de un usuario.
 * Útil para debugging en desarrollo.
 *
 * @param roleIds - Array de IDs de roles del usuario
 * @returns Objeto con información detallada de permisos
 */
export function getPermissionsDebugInfo(roleIds: number[]) {
  const allowedPages = getAllowedPageIds(roleIds)

  return {
    roleIds,
    totalRoles: roleIds.length,
    allowedPages,
    totalPages: allowedPages.length,
    permissionsByRole: roleIds.map(roleId => ({
      roleId,
      pages: ROLE_PERMISSIONS[roleId] || [],
      pageCount: (ROLE_PERMISSIONS[roleId] || []).length,
    }))
  }
}

// ============================================================================
// NOTAS DE USO
// ============================================================================

/**
 * EJEMPLO DE CÓMO USAR ESTE SISTEMA:
 *
 * 1. En el componente sidebar o donde necesites verificar permisos:
 *
 *    import { getAllowedPageIds } from '@/lib/role-permissions-config'
 *
 *    const user = useAuth().user
 *    const roleIds = user?.roles?.map(r => r.id) || []
 *    const allowedPages = getAllowedPageIds(roleIds)
 *
 * 2. Para verificar acceso a una página específica:
 *
 *    import { hasAccessToPage } from '@/lib/role-permissions-config'
 *
 *    if (hasAccessToPage('proyectos', roleIds)) {
 *      // El usuario puede ver esta página
 *    }
 *
 * 3. Para debugging en desarrollo:
 *
 *    import { getPermissionsDebugInfo } from '@/lib/role-permissions-config'
 *
 *    console.log('Permisos del usuario:', getPermissionsDebugInfo(roleIds))
 */