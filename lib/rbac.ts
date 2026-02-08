// RBAC utility functions for mobile app
import { Permission, ROLE_PERMISSIONS, Role } from './permissions';

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role | undefined, permission: Permission): boolean {
    if (!role) return false;
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    return rolePermissions.includes(permission);
}

/**
 * Check if a role has all specified permissions
 */
export function hasAllPermissions(role: Role | undefined, permissions: Permission[]): boolean {
    return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: Role | undefined, permissions: Permission[]): boolean {
    return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a role can perform an action on a resource
 */
export function canAccess(
    role: Role | undefined,
    resource: string,
    action: 'view' | 'create' | 'edit' | 'delete'
): boolean {
    if (!role) return false;
    const permission = `${resource}:${action}` as Permission;
    return hasPermission(role, permission);
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: Role): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
}
