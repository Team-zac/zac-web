export type WorldRoleValue = "ADMIN" | "EDITOR" | "OWNER" | "VIEWER";

export function canEditWorldRole(role: WorldRoleValue | null | undefined) {
  return role === "OWNER" || role === "ADMIN" || role === "EDITOR";
}

export function canAdminWorldRole(role: WorldRoleValue | null | undefined) {
  return role === "OWNER" || role === "ADMIN";
}
