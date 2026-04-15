import { AttachmentType } from '../enums';
/** Uploaded file attachment linked to client, submission, or email */
export interface Attachment {
    id: string;
    filename: string;
    file_url: string;
    file_size: number;
    mime_type: string;
    type: AttachmentType;
    client_id: string | null;
    submission_id: string | null;
    email_id: string | null;
    uploaded_by: string;
    description: string | null;
    tags: string[];
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=attachment.d.ts.map