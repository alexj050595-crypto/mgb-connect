export type UserRole = "messdiener" | "leiter" | "om" | "planschreiber" | "admin";
export type RoleDefinition = { id: UserRole; label: string; description: string };
export const roles: Record<UserRole, RoleDefinition> = {
messdiener:{id:"messdiener",label:"Messdiener",description:"Teilnehmer mit Zugriff auf eigene Dienste, Tauschbörse und Punkte."},
leiter:{id:"leiter",label:"Leiter",description:"Leitung mit zusätzlichen Übersichten und Leitungsfunktionen."},
om:{id:"om",label:"Obermessdiener",description:"Obermessdiener mit den gleichen Grundrechten wie Leiter."},
planschreiber:{id:"planschreiber",label:"Planschreiber",description:"Leitung mit Berechtigung zur Planverwaltung und Bearbeitung von Übernahmen."},
admin:{id:"admin",label:"Administrator",description:"Vollzugriff auf Verwaltung, Rollen, Pläne, Ankündigungen und Übernahmen."}};
export type Permission="view_leader_area"|"view_team"|"view_service_management"|"view_statistics"|"confirm_requests"|"manage_schedule"|"manage_attendance"|"manage_members"|"manage_roles"|"manage_announcements"|"manage_system";
export const permissions:Record<UserRole,Permission[]>={messdiener:[],leiter:["view_leader_area","view_team","view_service_management","view_statistics","manage_attendance"],om:["view_leader_area","view_team","view_service_management","view_statistics","manage_attendance","manage_announcements"],planschreiber:["view_leader_area","view_team","view_service_management","view_statistics","confirm_requests","manage_schedule","manage_attendance"],admin:["view_leader_area","view_team","view_service_management","view_statistics","confirm_requests","manage_schedule","manage_attendance","manage_members","manage_roles","manage_announcements","manage_system"]};
export function hasPermission(role:UserRole,permission:Permission){return permissions[role].includes(permission)}
export function isLeaderRole(role:UserRole){return role==="leiter"||role==="om"||role==="planschreiber"||role==="admin"}
export function isPlanWriterOrAdmin(role:UserRole){return role==="planschreiber"||role==="admin"}
export function isAdmin(role:UserRole){return role==="admin"}
