import { ManifestType } from '../enums';
/** Config-driven platform manifest entry */
export interface PlatformManifest {
    id: string;
    manifest_type: ManifestType;
    key: string;
    version: number;
    config: Record<string, unknown>;
    is_active: boolean;
    effective_from: string;
    effective_to: string | null;
    created_by: string;
    change_notes: string | null;
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=manifest.d.ts.map