export interface PermissionMatrixConfig {
  key: string;
  entity_key: string;
  role_permissions: Record<
    string,
    {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      row_filter?: string;
    }
  >;
}
