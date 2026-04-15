import { z } from 'zod';
import { UserRole, ClientStatus, ContactType, CarrierType, LOBCategory, FormPaperType, SubmissionStatus, SubmissionPriority, SubmissionTargetStatus, AttachmentType, EmailSource, EmailDirection, TemplateType, RelationshipStrength, PreferredContactMethod, SyncScheduleType, SyncFrequency, SyncJobType, AMSProvider, SyncDirection, ManifestType, NotificationType, ActivityType, EntityType } from '../types/enums';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    first_name: z.ZodString;
    last_name: z.ZodString;
    role: z.ZodOptional<z.ZodNativeEnum<typeof UserRole>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    role?: UserRole | undefined;
}, {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    role?: UserRole | undefined;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    refresh_token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refresh_token: string;
}, {
    refresh_token: string;
}>;
export declare const listQueryParamsSchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    sort: z.ZodOptional<z.ZodString>;
    order: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    sort?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    order?: "asc" | "desc" | undefined;
    search?: string | undefined;
}, {
    sort?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    order?: "asc" | "desc" | undefined;
    search?: string | undefined;
}>;
export declare const createUserSchema: z.ZodObject<{
    email: z.ZodString;
    first_name: z.ZodString;
    last_name: z.ZodString;
    role: z.ZodNativeEnum<typeof UserRole>;
    region: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    team_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    specialties: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    phone?: string | null | undefined;
    region?: string | null | undefined;
    team_id?: string | null | undefined;
    specialties?: string[] | undefined;
}, {
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    phone?: string | null | undefined;
    region?: string | null | undefined;
    team_id?: string | null | undefined;
    specialties?: string[] | undefined;
}>;
export declare const updateUserSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    first_name: z.ZodOptional<z.ZodString>;
    last_name: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodNativeEnum<typeof UserRole>>;
    region: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    team_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    specialties: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    phone?: string | null | undefined;
    first_name?: string | undefined;
    last_name?: string | undefined;
    role?: UserRole | undefined;
    region?: string | null | undefined;
    team_id?: string | null | undefined;
    specialties?: string[] | undefined;
}, {
    email?: string | undefined;
    phone?: string | null | undefined;
    first_name?: string | undefined;
    last_name?: string | undefined;
    role?: UserRole | undefined;
    region?: string | null | undefined;
    team_id?: string | null | undefined;
    specialties?: string[] | undefined;
}>;
export declare const createTeamSchema: z.ZodObject<{
    name: z.ZodString;
    region: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    manager_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    region?: string | null | undefined;
    manager_id?: string | null | undefined;
    description?: string | null | undefined;
}, {
    name: string;
    region?: string | null | undefined;
    manager_id?: string | null | undefined;
    description?: string | null | undefined;
}>;
export declare const updateTeamSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    region: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    manager_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    region?: string | null | undefined;
    name?: string | undefined;
    manager_id?: string | null | undefined;
    description?: string | null | undefined;
}, {
    region?: string | null | undefined;
    name?: string | undefined;
    manager_id?: string | null | undefined;
    description?: string | null | undefined;
}>;
export declare const createClientSchema: z.ZodObject<{
    company_name: z.ZodString;
    dba: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof ClientStatus>>;
    industry: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    naics_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sic_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    revenue: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    employee_count: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    website: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    primary_contact_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    primary_contact_email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    primary_contact_phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    addresses: z.ZodOptional<z.ZodArray<z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        zip: z.ZodString;
        type: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        street: string;
        city: string;
        state: string;
        zip: string;
    }, {
        type: string;
        street: string;
        city: string;
        state: string;
        zip: string;
    }>, "many">>;
    assigned_servicer_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    assigned_team_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    company_name: string;
    dba?: string | null | undefined;
    status?: ClientStatus | undefined;
    industry?: string | null | undefined;
    naics_code?: string | null | undefined;
    sic_code?: string | null | undefined;
    revenue?: number | null | undefined;
    employee_count?: number | null | undefined;
    website?: string | null | undefined;
    primary_contact_name?: string | null | undefined;
    primary_contact_email?: string | null | undefined;
    primary_contact_phone?: string | null | undefined;
    addresses?: {
        type: string;
        street: string;
        city: string;
        state: string;
        zip: string;
    }[] | undefined;
    assigned_servicer_id?: string | null | undefined;
    assigned_team_id?: string | null | undefined;
    notes?: string | null | undefined;
    tags?: string[] | undefined;
}, {
    company_name: string;
    dba?: string | null | undefined;
    status?: ClientStatus | undefined;
    industry?: string | null | undefined;
    naics_code?: string | null | undefined;
    sic_code?: string | null | undefined;
    revenue?: number | null | undefined;
    employee_count?: number | null | undefined;
    website?: string | null | undefined;
    primary_contact_name?: string | null | undefined;
    primary_contact_email?: string | null | undefined;
    primary_contact_phone?: string | null | undefined;
    addresses?: {
        type: string;
        street: string;
        city: string;
        state: string;
        zip: string;
    }[] | undefined;
    assigned_servicer_id?: string | null | undefined;
    assigned_team_id?: string | null | undefined;
    notes?: string | null | undefined;
    tags?: string[] | undefined;
}>;
export declare const updateClientSchema: z.ZodObject<{
    company_name: z.ZodOptional<z.ZodString>;
    dba: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    status: z.ZodOptional<z.ZodOptional<z.ZodNativeEnum<typeof ClientStatus>>>;
    industry: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    naics_code: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    sic_code: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    revenue: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    employee_count: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    website: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    primary_contact_name: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    primary_contact_email: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    primary_contact_phone: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    addresses: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        zip: z.ZodString;
        type: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        street: string;
        city: string;
        state: string;
        zip: string;
    }, {
        type: string;
        street: string;
        city: string;
        state: string;
        zip: string;
    }>, "many">>>;
    assigned_servicer_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    assigned_team_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    tags: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    company_name?: string | undefined;
    dba?: string | null | undefined;
    status?: ClientStatus | undefined;
    industry?: string | null | undefined;
    naics_code?: string | null | undefined;
    sic_code?: string | null | undefined;
    revenue?: number | null | undefined;
    employee_count?: number | null | undefined;
    website?: string | null | undefined;
    primary_contact_name?: string | null | undefined;
    primary_contact_email?: string | null | undefined;
    primary_contact_phone?: string | null | undefined;
    addresses?: {
        type: string;
        street: string;
        city: string;
        state: string;
        zip: string;
    }[] | undefined;
    assigned_servicer_id?: string | null | undefined;
    assigned_team_id?: string | null | undefined;
    notes?: string | null | undefined;
    tags?: string[] | undefined;
}, {
    company_name?: string | undefined;
    dba?: string | null | undefined;
    status?: ClientStatus | undefined;
    industry?: string | null | undefined;
    naics_code?: string | null | undefined;
    sic_code?: string | null | undefined;
    revenue?: number | null | undefined;
    employee_count?: number | null | undefined;
    website?: string | null | undefined;
    primary_contact_name?: string | null | undefined;
    primary_contact_email?: string | null | undefined;
    primary_contact_phone?: string | null | undefined;
    addresses?: {
        type: string;
        street: string;
        city: string;
        state: string;
        zip: string;
    }[] | undefined;
    assigned_servicer_id?: string | null | undefined;
    assigned_team_id?: string | null | undefined;
    notes?: string | null | undefined;
    tags?: string[] | undefined;
}>;
export declare const createContactSchema: z.ZodObject<{
    first_name: z.ZodString;
    last_name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mobile: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    contact_type: z.ZodNativeEnum<typeof ContactType>;
    title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    carrier_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    region: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    lines_of_business: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    preferred_contact_method: z.ZodOptional<z.ZodNativeEnum<typeof PreferredContactMethod>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    first_name: string;
    last_name: string;
    contact_type: ContactType;
    phone?: string | null | undefined;
    region?: string | null | undefined;
    notes?: string | null | undefined;
    tags?: string[] | undefined;
    mobile?: string | null | undefined;
    title?: string | null | undefined;
    carrier_id?: string | null | undefined;
    lines_of_business?: string[] | undefined;
    preferred_contact_method?: PreferredContactMethod | undefined;
}, {
    email: string;
    first_name: string;
    last_name: string;
    contact_type: ContactType;
    phone?: string | null | undefined;
    region?: string | null | undefined;
    notes?: string | null | undefined;
    tags?: string[] | undefined;
    mobile?: string | null | undefined;
    title?: string | null | undefined;
    carrier_id?: string | null | undefined;
    lines_of_business?: string[] | undefined;
    preferred_contact_method?: PreferredContactMethod | undefined;
}>;
export declare const updateContactSchema: z.ZodObject<{
    first_name: z.ZodOptional<z.ZodString>;
    last_name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    mobile: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    contact_type: z.ZodOptional<z.ZodNativeEnum<typeof ContactType>>;
    title: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    carrier_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    region: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    lines_of_business: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    tags: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    preferred_contact_method: z.ZodOptional<z.ZodOptional<z.ZodNativeEnum<typeof PreferredContactMethod>>>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    phone?: string | null | undefined;
    first_name?: string | undefined;
    last_name?: string | undefined;
    region?: string | null | undefined;
    notes?: string | null | undefined;
    tags?: string[] | undefined;
    mobile?: string | null | undefined;
    contact_type?: ContactType | undefined;
    title?: string | null | undefined;
    carrier_id?: string | null | undefined;
    lines_of_business?: string[] | undefined;
    preferred_contact_method?: PreferredContactMethod | undefined;
}, {
    email?: string | undefined;
    phone?: string | null | undefined;
    first_name?: string | undefined;
    last_name?: string | undefined;
    region?: string | null | undefined;
    notes?: string | null | undefined;
    tags?: string[] | undefined;
    mobile?: string | null | undefined;
    contact_type?: ContactType | undefined;
    title?: string | null | undefined;
    carrier_id?: string | null | undefined;
    lines_of_business?: string[] | undefined;
    preferred_contact_method?: PreferredContactMethod | undefined;
}>;
export declare const createCarrierSchema: z.ZodObject<{
    name: z.ZodString;
    am_best_rating: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    type: z.ZodNativeEnum<typeof CarrierType>;
    website: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    headquarters_state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    appointed: z.ZodOptional<z.ZodBoolean>;
    appointment_date: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    primary_contact_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    available_states: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: CarrierType;
    website?: string | null | undefined;
    notes?: string | null | undefined;
    am_best_rating?: string | null | undefined;
    headquarters_state?: string | null | undefined;
    appointed?: boolean | undefined;
    appointment_date?: string | null | undefined;
    primary_contact_id?: string | null | undefined;
    available_states?: string[] | undefined;
}, {
    name: string;
    type: CarrierType;
    website?: string | null | undefined;
    notes?: string | null | undefined;
    am_best_rating?: string | null | undefined;
    headquarters_state?: string | null | undefined;
    appointed?: boolean | undefined;
    appointment_date?: string | null | undefined;
    primary_contact_id?: string | null | undefined;
    available_states?: string[] | undefined;
}>;
export declare const updateCarrierSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    am_best_rating: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    type: z.ZodOptional<z.ZodNativeEnum<typeof CarrierType>>;
    website: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    headquarters_state: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    appointed: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    appointment_date: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    primary_contact_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    available_states: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    website?: string | null | undefined;
    notes?: string | null | undefined;
    am_best_rating?: string | null | undefined;
    type?: CarrierType | undefined;
    headquarters_state?: string | null | undefined;
    appointed?: boolean | undefined;
    appointment_date?: string | null | undefined;
    primary_contact_id?: string | null | undefined;
    available_states?: string[] | undefined;
}, {
    name?: string | undefined;
    website?: string | null | undefined;
    notes?: string | null | undefined;
    am_best_rating?: string | null | undefined;
    type?: CarrierType | undefined;
    headquarters_state?: string | null | undefined;
    appointed?: boolean | undefined;
    appointment_date?: string | null | undefined;
    primary_contact_id?: string | null | undefined;
    available_states?: string[] | undefined;
}>;
export declare const createLineOfBusinessSchema: z.ZodObject<{
    name: z.ZodString;
    abbreviation: z.ZodString;
    category: z.ZodNativeEnum<typeof LOBCategory>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    parent_line_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    abbreviation: string;
    category: LOBCategory;
    description?: string | null | undefined;
    parent_line_id?: string | null | undefined;
}, {
    name: string;
    abbreviation: string;
    category: LOBCategory;
    description?: string | null | undefined;
    parent_line_id?: string | null | undefined;
}>;
export declare const updateLineOfBusinessSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    abbreviation: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodNativeEnum<typeof LOBCategory>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    parent_line_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | null | undefined;
    abbreviation?: string | undefined;
    category?: LOBCategory | undefined;
    parent_line_id?: string | null | undefined;
}, {
    name?: string | undefined;
    description?: string | null | undefined;
    abbreviation?: string | undefined;
    category?: LOBCategory | undefined;
    parent_line_id?: string | null | undefined;
}>;
export declare const createFormPaperSchema: z.ZodObject<{
    name: z.ZodString;
    form_number: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    carrier_id: z.ZodString;
    line_of_business_id: z.ZodString;
    edition_date: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    type: z.ZodNativeEnum<typeof FormPaperType>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    carrier_id: string;
    type: FormPaperType;
    line_of_business_id: string;
    description?: string | null | undefined;
    form_number?: string | null | undefined;
    edition_date?: string | null | undefined;
}, {
    name: string;
    carrier_id: string;
    type: FormPaperType;
    line_of_business_id: string;
    description?: string | null | undefined;
    form_number?: string | null | undefined;
    edition_date?: string | null | undefined;
}>;
export declare const updateFormPaperSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    form_number: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    carrier_id: z.ZodOptional<z.ZodString>;
    line_of_business_id: z.ZodOptional<z.ZodString>;
    edition_date: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    type: z.ZodOptional<z.ZodNativeEnum<typeof FormPaperType>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | null | undefined;
    carrier_id?: string | undefined;
    type?: FormPaperType | undefined;
    form_number?: string | null | undefined;
    line_of_business_id?: string | undefined;
    edition_date?: string | null | undefined;
}, {
    name?: string | undefined;
    description?: string | null | undefined;
    carrier_id?: string | undefined;
    type?: FormPaperType | undefined;
    form_number?: string | null | undefined;
    line_of_business_id?: string | undefined;
    edition_date?: string | null | undefined;
}>;
export declare const createCapacitySchema: z.ZodObject<{
    contact_id: z.ZodString;
    carrier_id: z.ZodString;
    line_of_business_id: z.ZodString;
    form_paper_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    min_limit: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    max_limit: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    deployed_capacity: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    available_capacity: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sir_range: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    deductible_range: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    appetite_classes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    appetite_states: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    appetite_notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    carrier_id: string;
    line_of_business_id: string;
    contact_id: string;
    form_paper_id?: string | null | undefined;
    min_limit?: string | null | undefined;
    max_limit?: string | null | undefined;
    deployed_capacity?: string | null | undefined;
    available_capacity?: string | null | undefined;
    sir_range?: string | null | undefined;
    deductible_range?: string | null | undefined;
    appetite_classes?: string[] | undefined;
    appetite_states?: string[] | undefined;
    appetite_notes?: string | null | undefined;
}, {
    carrier_id: string;
    line_of_business_id: string;
    contact_id: string;
    form_paper_id?: string | null | undefined;
    min_limit?: string | null | undefined;
    max_limit?: string | null | undefined;
    deployed_capacity?: string | null | undefined;
    available_capacity?: string | null | undefined;
    sir_range?: string | null | undefined;
    deductible_range?: string | null | undefined;
    appetite_classes?: string[] | undefined;
    appetite_states?: string[] | undefined;
    appetite_notes?: string | null | undefined;
}>;
export declare const updateCapacitySchema: z.ZodObject<{
    contact_id: z.ZodOptional<z.ZodString>;
    carrier_id: z.ZodOptional<z.ZodString>;
    line_of_business_id: z.ZodOptional<z.ZodString>;
    form_paper_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    min_limit: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    max_limit: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    deployed_capacity: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    available_capacity: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    sir_range: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    deductible_range: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    appetite_classes: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    appetite_states: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    appetite_notes: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    carrier_id?: string | undefined;
    line_of_business_id?: string | undefined;
    contact_id?: string | undefined;
    form_paper_id?: string | null | undefined;
    min_limit?: string | null | undefined;
    max_limit?: string | null | undefined;
    deployed_capacity?: string | null | undefined;
    available_capacity?: string | null | undefined;
    sir_range?: string | null | undefined;
    deductible_range?: string | null | undefined;
    appetite_classes?: string[] | undefined;
    appetite_states?: string[] | undefined;
    appetite_notes?: string | null | undefined;
}, {
    carrier_id?: string | undefined;
    line_of_business_id?: string | undefined;
    contact_id?: string | undefined;
    form_paper_id?: string | null | undefined;
    min_limit?: string | null | undefined;
    max_limit?: string | null | undefined;
    deployed_capacity?: string | null | undefined;
    available_capacity?: string | null | undefined;
    sir_range?: string | null | undefined;
    deductible_range?: string | null | undefined;
    appetite_classes?: string[] | undefined;
    appetite_states?: string[] | undefined;
    appetite_notes?: string | null | undefined;
}>;
export declare const createSubmissionSchema: z.ZodObject<{
    client_id: z.ZodString;
    effective_date: z.ZodString;
    expiration_date: z.ZodString;
    lines_requested: z.ZodArray<z.ZodObject<{
        line_of_business_id: z.ZodString;
        requested_limit: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        line_of_business_id: string;
        notes?: string | null | undefined;
        requested_limit?: string | null | undefined;
    }, {
        line_of_business_id: string;
        notes?: string | null | undefined;
        requested_limit?: string | null | undefined;
    }>, "many">;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    priority: z.ZodOptional<z.ZodNativeEnum<typeof SubmissionPriority>>;
    renewal_of: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    client_id: string;
    effective_date: string;
    expiration_date: string;
    lines_requested: {
        line_of_business_id: string;
        notes?: string | null | undefined;
        requested_limit?: string | null | undefined;
    }[];
    notes?: string | null | undefined;
    priority?: SubmissionPriority | undefined;
    renewal_of?: string | null | undefined;
}, {
    client_id: string;
    effective_date: string;
    expiration_date: string;
    lines_requested: {
        line_of_business_id: string;
        notes?: string | null | undefined;
        requested_limit?: string | null | undefined;
    }[];
    notes?: string | null | undefined;
    priority?: SubmissionPriority | undefined;
    renewal_of?: string | null | undefined;
}>;
export declare const updateSubmissionSchema: z.ZodObject<{
    client_id: z.ZodOptional<z.ZodString>;
    effective_date: z.ZodOptional<z.ZodString>;
    expiration_date: z.ZodOptional<z.ZodString>;
    lines_requested: z.ZodOptional<z.ZodArray<z.ZodObject<{
        line_of_business_id: z.ZodString;
        requested_limit: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        line_of_business_id: string;
        notes?: string | null | undefined;
        requested_limit?: string | null | undefined;
    }, {
        line_of_business_id: string;
        notes?: string | null | undefined;
        requested_limit?: string | null | undefined;
    }>, "many">>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    priority: z.ZodOptional<z.ZodOptional<z.ZodNativeEnum<typeof SubmissionPriority>>>;
    renewal_of: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
} & {
    status: z.ZodOptional<z.ZodNativeEnum<typeof SubmissionStatus>>;
}, "strip", z.ZodTypeAny, {
    status?: SubmissionStatus | undefined;
    notes?: string | null | undefined;
    client_id?: string | undefined;
    effective_date?: string | undefined;
    expiration_date?: string | undefined;
    lines_requested?: {
        line_of_business_id: string;
        notes?: string | null | undefined;
        requested_limit?: string | null | undefined;
    }[] | undefined;
    priority?: SubmissionPriority | undefined;
    renewal_of?: string | null | undefined;
}, {
    status?: SubmissionStatus | undefined;
    notes?: string | null | undefined;
    client_id?: string | undefined;
    effective_date?: string | undefined;
    expiration_date?: string | undefined;
    lines_requested?: {
        line_of_business_id: string;
        notes?: string | null | undefined;
        requested_limit?: string | null | undefined;
    }[] | undefined;
    priority?: SubmissionPriority | undefined;
    renewal_of?: string | null | undefined;
}>;
export declare const createSubmissionTargetSchema: z.ZodObject<{
    submission_id: z.ZodString;
    contact_id: z.ZodString;
    carrier_id: z.ZodString;
    line_of_business_id: z.ZodString;
    response_due: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    carrier_id: string;
    line_of_business_id: string;
    contact_id: string;
    submission_id: string;
    notes?: string | null | undefined;
    response_due?: string | null | undefined;
}, {
    carrier_id: string;
    line_of_business_id: string;
    contact_id: string;
    submission_id: string;
    notes?: string | null | undefined;
    response_due?: string | null | undefined;
}>;
export declare const updateSubmissionTargetSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodNativeEnum<typeof SubmissionTargetStatus>>;
    quoted_premium: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    quoted_limit: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    quoted_deductible: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    quoted_terms: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    decline_reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: SubmissionTargetStatus | undefined;
    notes?: string | null | undefined;
    quoted_premium?: number | null | undefined;
    quoted_limit?: number | null | undefined;
    quoted_deductible?: number | null | undefined;
    quoted_terms?: Record<string, unknown> | null | undefined;
    decline_reason?: string | null | undefined;
}, {
    status?: SubmissionTargetStatus | undefined;
    notes?: string | null | undefined;
    quoted_premium?: number | null | undefined;
    quoted_limit?: number | null | undefined;
    quoted_deductible?: number | null | undefined;
    quoted_terms?: Record<string, unknown> | null | undefined;
    decline_reason?: string | null | undefined;
}>;
export declare const sendEmailSchema: z.ZodObject<{
    to_addresses: z.ZodArray<z.ZodString, "many">;
    cc_addresses: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    subject: z.ZodString;
    body_text: z.ZodString;
    body_html: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    client_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    submission_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    contact_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    thread_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    to_addresses: string[];
    subject: string;
    body_text: string;
    contact_id?: string | null | undefined;
    client_id?: string | null | undefined;
    submission_id?: string | null | undefined;
    cc_addresses?: string[] | undefined;
    body_html?: string | null | undefined;
    thread_id?: string | null | undefined;
}, {
    to_addresses: string[];
    subject: string;
    body_text: string;
    contact_id?: string | null | undefined;
    client_id?: string | null | undefined;
    submission_id?: string | null | undefined;
    cc_addresses?: string[] | undefined;
    body_html?: string | null | undefined;
    thread_id?: string | null | undefined;
}>;
export declare const startEmailImportSchema: z.ZodObject<{
    provider: z.ZodNativeEnum<typeof EmailSource>;
    date_range_start: z.ZodString;
    date_range_end: z.ZodString;
    excluded_contacts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    incremental_sync_enabled: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    provider: EmailSource;
    date_range_start: string;
    date_range_end: string;
    excluded_contacts?: string[] | undefined;
    incremental_sync_enabled?: boolean | undefined;
}, {
    provider: EmailSource;
    date_range_start: string;
    date_range_end: string;
    excluded_contacts?: string[] | undefined;
    incremental_sync_enabled?: boolean | undefined;
}>;
export declare const createAttachmentSchema: z.ZodObject<{
    filename: z.ZodString;
    file_url: z.ZodString;
    file_size: z.ZodNumber;
    mime_type: z.ZodString;
    type: z.ZodNativeEnum<typeof AttachmentType>;
    client_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    submission_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    email_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: AttachmentType;
    filename: string;
    file_url: string;
    file_size: number;
    mime_type: string;
    description?: string | null | undefined;
    tags?: string[] | undefined;
    client_id?: string | null | undefined;
    submission_id?: string | null | undefined;
    email_id?: string | null | undefined;
}, {
    type: AttachmentType;
    filename: string;
    file_url: string;
    file_size: number;
    mime_type: string;
    description?: string | null | undefined;
    tags?: string[] | undefined;
    client_id?: string | null | undefined;
    submission_id?: string | null | undefined;
    email_id?: string | null | undefined;
}>;
export declare const createActivitySchema: z.ZodObject<{
    type: z.ZodNativeEnum<typeof ActivityType>;
    entity_type: z.ZodNativeEnum<typeof EntityType>;
    entity_id: z.ZodString;
    summary: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    type: ActivityType;
    entity_type: EntityType;
    entity_id: string;
    summary: string;
    metadata?: Record<string, unknown> | undefined;
}, {
    type: ActivityType;
    entity_type: EntityType;
    entity_id: string;
    summary: string;
    metadata?: Record<string, unknown> | undefined;
}>;
export declare const createTemplateSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodNativeEnum<typeof TemplateType>;
    content: z.ZodString;
    merge_fields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    is_shared: z.ZodOptional<z.ZodBoolean>;
    category: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: TemplateType;
    content: string;
    category?: string | null | undefined;
    merge_fields?: string[] | undefined;
    is_shared?: boolean | undefined;
}, {
    name: string;
    type: TemplateType;
    content: string;
    category?: string | null | undefined;
    merge_fields?: string[] | undefined;
    is_shared?: boolean | undefined;
}>;
export declare const updateTemplateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodNativeEnum<typeof TemplateType>>;
    content: z.ZodOptional<z.ZodString>;
    merge_fields: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    is_shared: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    category: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    type?: TemplateType | undefined;
    category?: string | null | undefined;
    content?: string | undefined;
    merge_fields?: string[] | undefined;
    is_shared?: boolean | undefined;
}, {
    name?: string | undefined;
    type?: TemplateType | undefined;
    category?: string | null | undefined;
    content?: string | undefined;
    merge_fields?: string[] | undefined;
    is_shared?: boolean | undefined;
}>;
export declare const createNotificationSchema: z.ZodObject<{
    user_id: z.ZodString;
    type: z.ZodNativeEnum<typeof NotificationType>;
    title: z.ZodString;
    message: z.ZodString;
    action_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    type: NotificationType;
    user_id: string;
    message: string;
    action_url?: string | null | undefined;
}, {
    title: string;
    type: NotificationType;
    user_id: string;
    message: string;
    action_url?: string | null | undefined;
}>;
export declare const createNetworkRelationshipSchema: z.ZodObject<{
    contact_id: z.ZodString;
    strength: z.ZodOptional<z.ZodNativeEnum<typeof RelationshipStrength>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    introduced_by: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    contact_id: string;
    notes?: string | null | undefined;
    strength?: RelationshipStrength | undefined;
    introduced_by?: string | null | undefined;
}, {
    contact_id: string;
    notes?: string | null | undefined;
    strength?: RelationshipStrength | undefined;
    introduced_by?: string | null | undefined;
}>;
export declare const updateNetworkRelationshipSchema: z.ZodObject<{
    contact_id: z.ZodOptional<z.ZodString>;
    strength: z.ZodOptional<z.ZodOptional<z.ZodNativeEnum<typeof RelationshipStrength>>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    introduced_by: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    notes?: string | null | undefined;
    contact_id?: string | undefined;
    strength?: RelationshipStrength | undefined;
    introduced_by?: string | null | undefined;
}, {
    notes?: string | null | undefined;
    contact_id?: string | undefined;
    strength?: RelationshipStrength | undefined;
    introduced_by?: string | null | undefined;
}>;
export declare const createSyncScheduleSchema: z.ZodObject<{
    schedule_type: z.ZodNativeEnum<typeof SyncScheduleType>;
    frequency: z.ZodNativeEnum<typeof SyncFrequency>;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    schedule_type: SyncScheduleType;
    frequency: SyncFrequency;
    config?: Record<string, unknown> | undefined;
}, {
    schedule_type: SyncScheduleType;
    frequency: SyncFrequency;
    config?: Record<string, unknown> | undefined;
}>;
export declare const updateSyncScheduleSchema: z.ZodObject<{
    schedule_type: z.ZodOptional<z.ZodNativeEnum<typeof SyncScheduleType>>;
    frequency: z.ZodOptional<z.ZodNativeEnum<typeof SyncFrequency>>;
    config: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
} & {
    is_active: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    schedule_type?: SyncScheduleType | undefined;
    frequency?: SyncFrequency | undefined;
    config?: Record<string, unknown> | undefined;
    is_active?: boolean | undefined;
}, {
    schedule_type?: SyncScheduleType | undefined;
    frequency?: SyncFrequency | undefined;
    config?: Record<string, unknown> | undefined;
    is_active?: boolean | undefined;
}>;
export declare const createSyncJobSchema: z.ZodObject<{
    schedule_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    job_type: z.ZodNativeEnum<typeof SyncJobType>;
}, "strip", z.ZodTypeAny, {
    job_type: SyncJobType;
    schedule_id?: string | null | undefined;
}, {
    job_type: SyncJobType;
    schedule_id?: string | null | undefined;
}>;
export declare const createAMSConnectionSchema: z.ZodObject<{
    provider: z.ZodNativeEnum<typeof AMSProvider>;
    connection_name: z.ZodString;
    api_endpoint: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sync_direction: z.ZodNativeEnum<typeof SyncDirection>;
    field_mappings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    provider: AMSProvider;
    connection_name: string;
    sync_direction: SyncDirection;
    api_endpoint?: string | null | undefined;
    field_mappings?: Record<string, unknown> | undefined;
}, {
    provider: AMSProvider;
    connection_name: string;
    sync_direction: SyncDirection;
    api_endpoint?: string | null | undefined;
    field_mappings?: Record<string, unknown> | undefined;
}>;
export declare const updateAMSConnectionSchema: z.ZodObject<{
    provider: z.ZodOptional<z.ZodNativeEnum<typeof AMSProvider>>;
    connection_name: z.ZodOptional<z.ZodString>;
    api_endpoint: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    sync_direction: z.ZodOptional<z.ZodNativeEnum<typeof SyncDirection>>;
    field_mappings: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
} & {
    is_active: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    is_active?: boolean | undefined;
    provider?: AMSProvider | undefined;
    connection_name?: string | undefined;
    api_endpoint?: string | null | undefined;
    sync_direction?: SyncDirection | undefined;
    field_mappings?: Record<string, unknown> | undefined;
}, {
    is_active?: boolean | undefined;
    provider?: AMSProvider | undefined;
    connection_name?: string | undefined;
    api_endpoint?: string | null | undefined;
    sync_direction?: SyncDirection | undefined;
    field_mappings?: Record<string, unknown> | undefined;
}>;
export declare const createManifestSchema: z.ZodObject<{
    manifest_type: z.ZodNativeEnum<typeof ManifestType>;
    key: z.ZodString;
    config: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    effective_from: z.ZodString;
    effective_to: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    change_notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    key: string;
    config: Record<string, unknown>;
    manifest_type: ManifestType;
    effective_from: string;
    effective_to?: string | null | undefined;
    change_notes?: string | null | undefined;
}, {
    key: string;
    config: Record<string, unknown>;
    manifest_type: ManifestType;
    effective_from: string;
    effective_to?: string | null | undefined;
    change_notes?: string | null | undefined;
}>;
export declare const updateManifestSchema: z.ZodObject<{
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    effective_to: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    is_active: z.ZodOptional<z.ZodBoolean>;
    change_notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    config?: Record<string, unknown> | undefined;
    is_active?: boolean | undefined;
    effective_to?: string | null | undefined;
    change_notes?: string | null | undefined;
}, {
    config?: Record<string, unknown> | undefined;
    is_active?: boolean | undefined;
    effective_to?: string | null | undefined;
    change_notes?: string | null | undefined;
}>;
export declare const createEmailRecordSchema: z.ZodObject<{
    thread_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    direction: z.ZodNativeEnum<typeof EmailDirection>;
    from_address: z.ZodString;
    to_addresses: z.ZodArray<z.ZodString, "many">;
    cc_addresses: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    subject: z.ZodString;
    body_text: z.ZodString;
    body_html: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sent_at: z.ZodString;
    client_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    submission_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    contact_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    source: z.ZodOptional<z.ZodNativeEnum<typeof EmailSource>>;
}, "strip", z.ZodTypeAny, {
    direction: EmailDirection;
    to_addresses: string[];
    subject: string;
    body_text: string;
    from_address: string;
    sent_at: string;
    contact_id?: string | null | undefined;
    client_id?: string | null | undefined;
    submission_id?: string | null | undefined;
    cc_addresses?: string[] | undefined;
    body_html?: string | null | undefined;
    thread_id?: string | null | undefined;
    source?: EmailSource | undefined;
}, {
    direction: EmailDirection;
    to_addresses: string[];
    subject: string;
    body_text: string;
    from_address: string;
    sent_at: string;
    contact_id?: string | null | undefined;
    client_id?: string | null | undefined;
    submission_id?: string | null | undefined;
    cc_addresses?: string[] | undefined;
    body_html?: string | null | undefined;
    thread_id?: string | null | undefined;
    source?: EmailSource | undefined;
}>;
//# sourceMappingURL=schemas.d.ts.map