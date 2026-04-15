const full = { create: true, read: true, update: true, delete: true };
const readOnly = { create: false, read: true, update: false, delete: false };
const noDelete = { create: true, read: true, update: true, delete: false };
const ownOnly = { create: true, read: true, update: true, delete: false, row_filter: 'own' };
const teamOnly = { create: true, read: true, update: true, delete: false, row_filter: 'team' };
const entities = [
    'user',
    'team',
    'client',
    'contact',
    'carrier',
    'line_of_business',
    'form_paper',
    'capacity',
    'submission',
    'submission_target',
    'email',
    'attachment',
    'activity',
    'template',
    'notification',
    'network_relationship',
    'sync_schedule',
    'sync_job',
    'ams_connection',
    'manifest',
];
function buildRolePermissions(defaults, overrides = {}) {
    const perms = {};
    for (const entity of entities) {
        perms[entity] = overrides[entity] ?? defaults;
    }
    return perms;
}
export const DEFAULT_PERMISSIONS = {
    admin: buildRolePermissions(full),
    manager: buildRolePermissions(noDelete, {
        user: readOnly,
        team: readOnly,
        manifest: readOnly,
        ams_connection: readOnly,
        sync_schedule: readOnly,
        sync_job: readOnly,
    }),
    servicer: buildRolePermissions(teamOnly, {
        user: readOnly,
        team: readOnly,
        carrier: readOnly,
        line_of_business: readOnly,
        form_paper: readOnly,
        manifest: readOnly,
        ams_connection: readOnly,
        sync_schedule: readOnly,
        sync_job: readOnly,
        submission: ownOnly,
        submission_target: ownOnly,
        email: ownOnly,
        template: ownOnly,
    }),
    viewer: buildRolePermissions(readOnly),
};
//# sourceMappingURL=permissions.js.map