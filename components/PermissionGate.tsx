// PermissionGate component for role-based UI rendering
import React from 'react';
import { Permission, Role } from '../lib/permissions';
import { hasAnyPermission, hasPermission } from '../lib/rbac';
import { useAuthStore } from '../lib/store';

interface PermissionGateProps {
    /** Required permission(s) - if array, uses 'any' logic by default */
    permission: Permission | Permission[];
    /** Require all permissions (default: false = any permission) */
    requireAll?: boolean;
    /** Fallback content when permission denied */
    fallback?: React.ReactNode;
    /** Children to render when permission granted */
    children: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 * 
 * @example
 * // Single permission
 * <PermissionGate permission={PERMISSIONS.DRONE_CREATE}>
 *   <AddDroneButton />
 * </PermissionGate>
 * 
 * @example
 * // Any of multiple permissions
 * <PermissionGate permission={[PERMISSIONS.DRONE_EDIT, PERMISSIONS.DRONE_DELETE]}>
 *   <DroneActions />
 * </PermissionGate>
 * 
 * @example
 * // All permissions required
 * <PermissionGate permission={[PERMISSIONS.COMPLIANCE_UPLOAD, PERMISSIONS.COMPLIANCE_APPROVE]} requireAll>
 *   <ComplianceApprovalPanel />
 * </PermissionGate>
 */
export function PermissionGate({
    permission,
    requireAll = false,
    fallback = null,
    children,
}: PermissionGateProps) {
    const { user } = useAuthStore();
    const userRole = (user as any)?.role as Role | undefined;

    if (!userRole) {
        return <>{fallback}</>;
    }

    const permissions = Array.isArray(permission) ? permission : [permission];

    let hasAccess: boolean;
    if (requireAll) {
        hasAccess = permissions.every((p) => hasPermission(userRole, p));
    } else {
        hasAccess = hasAnyPermission(userRole, permissions);
    }

    return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * Hook to check permissions in components
 */
export function usePermission(permission: Permission): boolean {
    const { user } = useAuthStore();
    const userRole = (user as any)?.role as Role | undefined;
    return hasPermission(userRole, permission);
}

/**
 * Hook to check resource access
 */
export function useCanAccess(
    resource: string,
    action: 'view' | 'create' | 'edit' | 'delete'
): boolean {
    const { user } = useAuthStore();
    const userRole = (user as any)?.role as Role | undefined;
    if (!userRole) return false;
    const permission = `${resource}:${action}` as Permission;
    return hasPermission(userRole, permission);
}

export default PermissionGate;
