/** Underwriter capacity for a given carrier and line of business */
export interface UnderwriterCapacity {
    id: string;
    contact_id: string;
    carrier_id: string;
    line_of_business_id: string;
    form_paper_id: string | null;
    min_limit: string | null;
    max_limit: string | null;
    deployed_capacity: string | null;
    available_capacity: string | null;
    sir_range: string | null;
    deductible_range: string | null;
    appetite_classes: string[];
    appetite_states: string[];
    appetite_notes: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
}
//# sourceMappingURL=capacity.d.ts.map