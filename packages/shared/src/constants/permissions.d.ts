/** Rule describing CRUD permissions for a role on an entity */
export interface PermissionRule {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    row_filter?: string;
}
export type PermissionMatrix = Record<string, Record<string, PermissionRule>>;
export declare const DEFAULT_PERMISSIONS: PermissionMatrix;
//# sourceMappingURL=permissions.d.ts.map