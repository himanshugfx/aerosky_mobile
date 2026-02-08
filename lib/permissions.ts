// Permission constants for mobile app RBAC
// Mirrors the backend permissions for client-side checks

// Role enum matching backend
export type Role =
    | 'SUPER_ADMIN'
    | 'ADMIN'
    | 'OPERATIONS_MANAGER'
    | 'QA_MANAGER'
    | 'PILOT'
    | 'TECHNICIAN'
    | 'VIEWER';

// Permission constants
export const PERMISSIONS = {
    // Drones
    DRONE_VIEW: 'drone:view',
    DRONE_CREATE: 'drone:create',
    DRONE_EDIT: 'drone:edit',
    DRONE_DELETE: 'drone:delete',

    // Orders
    ORDER_VIEW: 'order:view',
    ORDER_CREATE: 'order:create',
    ORDER_EDIT: 'order:edit',
    ORDER_DELETE: 'order:delete',

    // Team
    TEAM_VIEW: 'team:view',
    TEAM_CREATE: 'team:create',
    TEAM_EDIT: 'team:edit',
    TEAM_DELETE: 'team:delete',

    // Subcontractors
    SUBCONTRACTOR_VIEW: 'subcontractor:view',
    SUBCONTRACTOR_CREATE: 'subcontractor:create',
    SUBCONTRACTOR_EDIT: 'subcontractor:edit',
    SUBCONTRACTOR_DELETE: 'subcontractor:delete',

    // Batteries
    BATTERY_VIEW: 'battery:view',
    BATTERY_CREATE: 'battery:create',
    BATTERY_EDIT: 'battery:edit',
    BATTERY_DELETE: 'battery:delete',

    // Compliance
    COMPLIANCE_VIEW: 'compliance:view',
    COMPLIANCE_UPLOAD: 'compliance:upload',
    COMPLIANCE_APPROVE: 'compliance:approve',

    // Reports
    REPORT_VIEW: 'report:view',
    REPORT_EXPORT: 'report:export',

    // Settings
    SETTINGS_VIEW: 'settings:view',
    SETTINGS_EDIT: 'settings:edit',
    SETTINGS_ADMIN: 'settings:admin',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Role-permission mappings
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    SUPER_ADMIN: Object.values(PERMISSIONS),

    ADMIN: Object.values(PERMISSIONS).filter((p) => p !== PERMISSIONS.SETTINGS_ADMIN),

    OPERATIONS_MANAGER: [
        PERMISSIONS.DRONE_VIEW,
        PERMISSIONS.DRONE_CREATE,
        PERMISSIONS.DRONE_EDIT,
        PERMISSIONS.ORDER_VIEW,
        PERMISSIONS.ORDER_CREATE,
        PERMISSIONS.ORDER_EDIT,
        PERMISSIONS.TEAM_VIEW,
        PERMISSIONS.TEAM_CREATE,
        PERMISSIONS.TEAM_EDIT,
        PERMISSIONS.SUBCONTRACTOR_VIEW,
        PERMISSIONS.SUBCONTRACTOR_CREATE,
        PERMISSIONS.SUBCONTRACTOR_EDIT,
        PERMISSIONS.BATTERY_VIEW,
        PERMISSIONS.BATTERY_CREATE,
        PERMISSIONS.BATTERY_EDIT,
        PERMISSIONS.COMPLIANCE_VIEW,
        PERMISSIONS.COMPLIANCE_UPLOAD,
        PERMISSIONS.REPORT_VIEW,
        PERMISSIONS.REPORT_EXPORT,
        PERMISSIONS.SETTINGS_VIEW,
    ],

    QA_MANAGER: [
        PERMISSIONS.DRONE_VIEW,
        PERMISSIONS.DRONE_EDIT,
        PERMISSIONS.ORDER_VIEW,
        PERMISSIONS.TEAM_VIEW,
        PERMISSIONS.SUBCONTRACTOR_VIEW,
        PERMISSIONS.BATTERY_VIEW,
        PERMISSIONS.COMPLIANCE_VIEW,
        PERMISSIONS.COMPLIANCE_UPLOAD,
        PERMISSIONS.COMPLIANCE_APPROVE,
        PERMISSIONS.REPORT_VIEW,
        PERMISSIONS.REPORT_EXPORT,
    ],

    PILOT: [
        PERMISSIONS.DRONE_VIEW,
        PERMISSIONS.TEAM_VIEW,
        PERMISSIONS.BATTERY_VIEW,
        PERMISSIONS.COMPLIANCE_VIEW,
        PERMISSIONS.COMPLIANCE_UPLOAD,
    ],

    TECHNICIAN: [
        PERMISSIONS.DRONE_VIEW,
        PERMISSIONS.BATTERY_VIEW,
        PERMISSIONS.BATTERY_CREATE,
        PERMISSIONS.BATTERY_EDIT,
        PERMISSIONS.TEAM_VIEW,
        PERMISSIONS.COMPLIANCE_VIEW,
        PERMISSIONS.COMPLIANCE_UPLOAD,
    ],

    VIEWER: [
        PERMISSIONS.DRONE_VIEW,
        PERMISSIONS.ORDER_VIEW,
        PERMISSIONS.TEAM_VIEW,
        PERMISSIONS.SUBCONTRACTOR_VIEW,
        PERMISSIONS.BATTERY_VIEW,
        PERMISSIONS.COMPLIANCE_VIEW,
        PERMISSIONS.REPORT_VIEW,
    ],
};

// Role display names
export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
    SUPER_ADMIN: 'Super Administrator',
    ADMIN: 'Administrator',
    OPERATIONS_MANAGER: 'Operations Manager',
    QA_MANAGER: 'QA Manager',
    PILOT: 'Remote Pilot',
    TECHNICIAN: 'Technician',
    VIEWER: 'Viewer',
};
