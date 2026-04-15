/** Pagination metadata returned with list endpoints */
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
}
/** Standard success response wrapping a single entity */
export interface ApiResponse<T> {
    data: T;
}
/** Standard success response wrapping a list with pagination */
export interface ApiListResponse<T> {
    data: T[];
    meta: PaginationMeta;
}
/** Standard error payload */
export interface ApiErrorDetail {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}
/** Standard error response */
export interface ApiErrorResponse {
    error: ApiErrorDetail;
}
/** Auth tokens returned on login / refresh */
export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}
/** Login response includes tokens and user info */
export interface LoginResponse {
    tokens: AuthTokens;
    user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        role: string;
    };
}
//# sourceMappingURL=responses.d.ts.map