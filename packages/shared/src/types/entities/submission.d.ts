import { SubmissionStatus, SubmissionPriority, SubmissionTargetStatus } from '../enums';
/** Individual line requested within a submission */
export interface SubmissionLine {
    line_of_business_id: string;
    requested_limit: string | null;
    notes: string | null;
}
/** Submission package sent to carriers requesting quotes */
export interface Submission {
    id: string;
    client_id: string;
    created_by: string;
    status: SubmissionStatus;
    effective_date: string;
    expiration_date: string;
    lines_requested: SubmissionLine[];
    submission_date: string | null;
    notes: string | null;
    priority: SubmissionPriority;
    renewal_of: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    updated_by: string | null;
}
/** A specific carrier/underwriter targeted by a submission */
export interface SubmissionTarget {
    id: string;
    submission_id: string;
    contact_id: string;
    carrier_id: string;
    line_of_business_id: string;
    status: SubmissionTargetStatus;
    sent_at: string | null;
    response_due: string | null;
    quoted_premium: number | null;
    quoted_limit: number | null;
    quoted_deductible: number | null;
    quoted_terms: Record<string, unknown> | null;
    decline_reason: string | null;
    notes: string | null;
    email_thread_id: string | null;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
}
//# sourceMappingURL=submission.d.ts.map