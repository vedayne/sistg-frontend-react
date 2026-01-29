import { BookOpen, FileText, Settings, BarChart3, Users, HelpCircle, Zap, FolderOpen, type LucideIcon, Home, ShieldCheck, } from "lucide-react";
export enum UserRole {
    ADMIN = "ADMIN",
    UTIC = "UTIC",
    DOCENTETG = "DOCENTETG",
    ESTUDIANTE = "ESTUDIANTE",
    TUTOR = "TUTOR",
    REVISOR = "REVISOR",
    JEFECARRERA = "JEFECARRERA",
    DDE = "DDE",
    SECRETARIA = "SECRETARIA",
    INVITADO = "INVITADO"
}
export interface MenuItem {
    id: string;
    label: string;
    icon: LucideIcon;
    description: string;
    roles: UserRole[];
}
const ALL_ROLES = Object.values(UserRole);
const ADMIN_ROLES = [UserRole.ADMIN, UserRole.UTIC];
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
];
export function getAuthorizedMenuItems(userRoles: string[] = []): MenuItem[] {
    const userRoleSet = new Set(userRoles.map(r => r.toUpperCase()));
    return MENU_ITEMS.filter((item) => {
        return item.roles.some((allowedRole) => userRoleSet.has(allowedRole));
    });
}
export function hasAccess(pageId: string, userRoles: string[] = []): boolean {
    const item = MENU_ITEMS.find((i) => i.id === pageId);
    if (!item)
        return false;
    const userRoleSet = new Set(userRoles.map(r => r.toUpperCase()));
    return item.roles.some((allowedRole) => userRoleSet.has(allowedRole));
}
