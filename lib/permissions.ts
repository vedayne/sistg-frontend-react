import {
    BookOpen,
    FileText,
    Settings,
    BarChart3,
    Users,
    HelpCircle,
    Zap,
    FolderOpen,
    type LucideIcon,
    Home,
    ShieldCheck,
} from "lucide-react"
import { getAllowedPageIds, hasAccessToPage } from "./role-permissions-config"
import type { Role } from "./types"

// Define all possible roles in the system
// ACTUALIZADO: Basado en los roles reales del backend (2025-12-14)
export enum UserRole {
    ADMIN = "ADMIN",                // ID 1
    DOCENTETG = "DOCENTETG",        // ID 2
    ESTUDIANTE = "ESTUDIANTE",      // ID 3
    TUTOR = "TUTOR",                // ID 4
    REVISOR = "REVISOR",            // ID 5
    JEFECARRERA = "JEFECARRERA",    // ID 6
    DDE = "DDE",                    // ID 7
    SECRETARIA = "SECRETARIA",      // ID 8
    INVITADO = "INVITADO",          // ID 9
    // NOTA: REVISOR1 y REVISOR2 no existen como roles separados en el backend
    // Se manejan a nivel de lógica de negocio usando el rol REVISOR (ID 5)
    REVISOR1 = "REVISOR1",          // Alias para lógica interna
    REVISOR2 = "REVISOR2",          // Alias para lógica interna
}

export interface MenuItem {
    id: string
    label: string
    icon: LucideIcon
    description: string
    roles: UserRole[] // Allowed roles
}

// Helper to group roles
const ALL_ROLES = Object.values(UserRole)
const ADMIN_ROLES = [UserRole.ADMIN]  // Solo ADMIN tiene acceso completo

// All available menu items with their allowed roles based on user request
export const MENU_ITEMS: MenuItem[] = [
    {
        id: "perfil",
        label: "Perfil",
        icon: Users,
        description: "Mi Perfil",
        roles: ALL_ROLES,
    },
    {
        id: "listado-usuario",
        label: "Listado Usuario",
        icon: Users,
        description: "Usuarios",
        roles: [
            ...ADMIN_ROLES,
            UserRole.DOCENTETG,
            UserRole.JEFECARRERA,
            UserRole.DDE,
        ],
    },
    {
        id: "asignacion-roles",
        label: "Asignar Roles",
        icon: ShieldCheck,
        description: "Asignar roles a usuarios",
        roles: ADMIN_ROLES,
    },
    {
        id: "estudiantes",
        label: "Estudiantes",
        icon: Users,
        description: "Listado de estudiantes",
        roles: [
            ...ADMIN_ROLES,
            UserRole.DOCENTETG,
            UserRole.TUTOR,
            UserRole.REVISOR,
            UserRole.REVISOR1,
            UserRole.REVISOR2,
            UserRole.JEFECARRERA,
            UserRole.DDE,
            UserRole.SECRETARIA,
        ],
    },
    {
        id: "registro-temario",
        label: "Registro Temario",
        icon: FileText,
        description: "Temario tentativo",
        roles: [
            ...ADMIN_ROLES,
            UserRole.DOCENTETG,
            UserRole.ESTUDIANTE,
        ],
    },
    {
        id: "proyectos",
        label: "Proyecto",
        icon: FolderOpen,
        description: "Proyectos de TG",
        roles: [
            ...ADMIN_ROLES,
            UserRole.DOCENTETG,
            UserRole.ESTUDIANTE,
            UserRole.TUTOR,
            UserRole.REVISOR,
            UserRole.REVISOR1,
            UserRole.REVISOR2,
            UserRole.JEFECARRERA,
            UserRole.DDE,
            UserRole.SECRETARIA,
        ],
    },
    {
        id: "entregas",
        label: "Entregas",
        icon: FileText,
        description: "Gestión de entregas",
        roles: [
            ...ADMIN_ROLES,
            UserRole.DOCENTETG,
            UserRole.ESTUDIANTE,
            UserRole.TUTOR,
            UserRole.REVISOR,
            UserRole.REVISOR1,
            UserRole.REVISOR2,
        ],
    },
    {
        id: "documentacion",
        label: "Documentación",
        icon: FileText,
        description: "Documentos",
        roles: [
            ...ADMIN_ROLES,
            UserRole.DOCENTETG,
            UserRole.ESTUDIANTE,
            UserRole.SECRETARIA,
        ],
    },
    {
        id: "nombramiento-tutor",
        label: "Nombramiento Tutor",
        icon: Users,
        description: "Selecciona tutor",
        roles: [
            ...ADMIN_ROLES,
            UserRole.ESTUDIANTE,
        ],
    },
    {
        id: "configuraciones",
        label: "Configuraciones",
        icon: Settings,
        description: "Sistema",
        roles: ADMIN_ROLES,
    },
    {
        id: "defensas",
        label: "Defensas",
        icon: BookOpen,
        description: "Defensas de TG",
        roles: [
            ...ADMIN_ROLES,
            UserRole.ESTUDIANTE,
            UserRole.TUTOR,
            UserRole.REVISOR,
            UserRole.REVISOR1,
            UserRole.REVISOR2,
            UserRole.JEFECARRERA,
            UserRole.DDE,
        ],
    },
    {
        id: "reporte",
        label: "Generar Reporte",
        icon: BarChart3,
        description: "Reportes",
        roles: ADMIN_ROLES,
    },
    {
        id: "manual",
        label: "Manual de Usuario",
        icon: HelpCircle,
        description: "Manual",
        roles: ALL_ROLES,
    },
    {
        id: "flujograma",
        label: "Flujograma",
        icon: Zap,
        description: "Proceso",
        roles: ALL_ROLES,
    },
]

/**
 * Returns the list of menu items authorized for a given list of user roles.
 * NUEVO: Ahora usa IDs de roles en lugar de nombres.
 *
 * @param roles - Array de objetos Role con {id, name, description} desde la API
 * @returns Array de MenuItem que el usuario puede acceder
 */
export function getAuthorizedMenuItems(roles: Role[] = []): MenuItem[] {
    // Extraemos los IDs de los roles del usuario
    const roleIds = roles.map(r => r.id)

    // Obtenemos todas las páginas permitidas basadas en los IDs de roles
    // Esta función combina automáticamente permisos de múltiples roles
    const allowedPageIds = getAllowedPageIds(roleIds)

    // Filtramos los items del menú que están en la lista de páginas permitidas
    return MENU_ITEMS.filter(item => allowedPageIds.includes(item.id))
}

/**
 * FUNCIÓN LEGACY: Mantiene compatibilidad con código existente que usa nombres de roles.
 * Se recomienda usar getAuthorizedMenuItems(roles) con objetos Role completos.
 *
 * @deprecated Usa getAuthorizedMenuItems(roles: Role[]) en su lugar
 */
export function getAuthorizedMenuItemsByName(userRoles: string[] = []): MenuItem[] {
    // Normalize checking: The backend sends strings like "ADMIN", "ESTUDIANTE".
    // We ensure we match them against our enum values.

    // Create a Set of allowed roles for the user for O(1) lookup
    // We map to upper case just in case, but assume identifiers are consistent.
    const userRoleSet = new Set(userRoles.map(r => r.toUpperCase()));

    return MENU_ITEMS.filter((item) => {
        // Check if ANY of the item's allowed roles is held by the user
        return item.roles.some((allowedRole) => userRoleSet.has(allowedRole));
    })
}

/**
 * Checks if a user has permission to access a specific page/module ID
 * NUEVO: Ahora usa IDs de roles en lugar de nombres.
 *
 * @param pageId - ID de la página a verificar
 * @param roles - Array de objetos Role con {id, name, description} desde la API
 * @returns true si el usuario tiene acceso, false en caso contrario
 */
export function hasAccess(pageId: string, roles: Role[] = []): boolean {
    // Extraemos los IDs de los roles
    const roleIds = roles.map(r => r.id)

    // Usamos la función del nuevo sistema de permisos
    return hasAccessToPage(pageId, roleIds)
}

/**
 * FUNCIÓN LEGACY: Mantiene compatibilidad con código existente que usa nombres de roles.
 *
 * @deprecated Usa hasAccess(pageId, roles: Role[]) en su lugar
 */
export function hasAccessByName(pageId: string, userRoles: string[] = []): boolean {
    const item = MENU_ITEMS.find((i) => i.id === pageId)
    if (!item) return false
    const userRoleSet = new Set(userRoles.map(r => r.toUpperCase()));
    return item.roles.some((allowedRole) => userRoleSet.has(allowedRole))
}
