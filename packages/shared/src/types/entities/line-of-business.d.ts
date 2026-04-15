import { LOBCategory } from '../enums';
/** Line of business (GL, Property, WC, etc.) */
export interface LineOfBusiness {
    id: string;
    name: string;
    abbreviation: string;
    category: LOBCategory;
    description: string | null;
    parent_line_id: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
}
//# sourceMappingURL=line-of-business.d.ts.map