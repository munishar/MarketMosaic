import { UserRole } from '../enums';
/** Internal platform user */
export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    region: string | null;
    team_id: string | null;
    specialties: string[];
    phone: string | null;
    is_active: boolean;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
}
/** Team grouping for servicers */
export interface Team {
    id: string;
    name: string;
    region: string | null;
    manager_id: string | null;
    description: string | null;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
}
//# sourceMappingURL=user.d.ts.map