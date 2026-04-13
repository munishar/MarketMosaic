-- 005: Default platform manifests

INSERT INTO platform_manifests (id, manifest_type, key, version, config, is_active, created_by, change_notes)
VALUES
  -- Navigation manifest
  ('f2000000-0000-0000-0000-000000000001', 'navigation', 'main_navigation', 1, '{
    "items": [
      {"key": "dashboard", "label": "Dashboard", "icon": "LayoutDashboard", "path": "/", "order": 1},
      {"key": "clients", "label": "Clients", "icon": "Building2", "path": "/clients", "order": 2},
      {"key": "submissions", "label": "Submissions", "icon": "FileText", "path": "/submissions", "order": 3},
      {"key": "contacts", "label": "Contacts", "icon": "Users", "path": "/contacts", "order": 4},
      {"key": "carriers", "label": "Carriers", "icon": "Shield", "path": "/carriers", "order": 5},
      {"key": "emails", "label": "Emails", "icon": "Mail", "path": "/emails", "order": 6},
      {"key": "network", "label": "Network", "icon": "Network", "path": "/network", "order": 7},
      {"key": "capacity", "label": "Capacity", "icon": "BarChart3", "path": "/capacity", "order": 8},
      {"key": "reports", "label": "Reports", "icon": "PieChart", "path": "/reports", "order": 9},
      {"key": "settings", "label": "Settings", "icon": "Settings", "path": "/settings", "order": 10}
    ]
  }', true, 'b0000000-0000-0000-0000-000000000001', 'Initial navigation structure'),

  -- Permission matrix
  ('f2000000-0000-0000-0000-000000000002', 'permission_matrix', 'role_permissions', 1, '{
    "roles": {
      "admin": {"clients": ["create","read","update","delete"], "submissions": ["create","read","update","delete"], "contacts": ["create","read","update","delete"], "carriers": ["create","read","update","delete"], "users": ["create","read","update","delete"], "settings": ["read","update"], "reports": ["read"]},
      "manager": {"clients": ["create","read","update"], "submissions": ["create","read","update"], "contacts": ["create","read","update"], "carriers": ["create","read","update"], "users": ["read"], "settings": ["read"], "reports": ["read"]},
      "servicer": {"clients": ["create","read","update"], "submissions": ["create","read","update"], "contacts": ["create","read","update"], "carriers": ["read"], "users": [], "settings": ["read"], "reports": ["read"]},
      "viewer": {"clients": ["read"], "submissions": ["read"], "contacts": ["read"], "carriers": ["read"], "users": [], "settings": [], "reports": ["read"]}
    }
  }', true, 'b0000000-0000-0000-0000-000000000001', 'Default role-based permissions'),

  -- Client entity definition
  ('f2000000-0000-0000-0000-000000000003', 'entity_definition', 'client_entity', 1, '{
    "name": "Client",
    "tableName": "clients",
    "primaryKey": "id",
    "displayField": "company_name",
    "searchFields": ["company_name", "dba", "industry", "primary_contact_name", "primary_contact_email"],
    "defaultSort": {"field": "company_name", "order": "asc"},
    "statuses": ["prospect", "active", "inactive", "lost"]
  }', true, 'b0000000-0000-0000-0000-000000000001', 'Client entity definition'),

  -- Submission entity definition
  ('f2000000-0000-0000-0000-000000000004', 'entity_definition', 'submission_entity', 1, '{
    "name": "Submission",
    "tableName": "submissions",
    "primaryKey": "id",
    "displayField": "id",
    "searchFields": ["notes"],
    "defaultSort": {"field": "created_at", "order": "desc"},
    "statuses": ["draft", "submitted", "quoted", "bound", "declined", "expired", "lost"]
  }', true, 'b0000000-0000-0000-0000-000000000001', 'Submission entity definition'),

  -- Submission workflow definition
  ('f2000000-0000-0000-0000-000000000005', 'workflow_definition', 'submission_workflow', 1, '{
    "name": "Submission Lifecycle",
    "entity": "submission",
    "states": ["draft", "submitted", "quoted", "bound", "declined", "expired", "lost"],
    "transitions": [
      {"from": "draft", "to": "submitted", "label": "Submit", "requiredFields": ["effective_date", "expiration_date"]},
      {"from": "submitted", "to": "quoted", "label": "Quote Received"},
      {"from": "submitted", "to": "declined", "label": "Declined"},
      {"from": "quoted", "to": "bound", "label": "Bind"},
      {"from": "quoted", "to": "declined", "label": "Decline"},
      {"from": "quoted", "to": "expired", "label": "Expire"},
      {"from": "submitted", "to": "expired", "label": "Expire"},
      {"from": "draft", "to": "lost", "label": "Lost"},
      {"from": "submitted", "to": "lost", "label": "Lost"}
    ]
  }', true, 'b0000000-0000-0000-0000-000000000001', 'Submission workflow transitions'),

  -- UI Layout for client list
  ('f2000000-0000-0000-0000-000000000006', 'ui_layout', 'client_list_columns', 1, '{
    "columns": [
      {"key": "company_name", "label": "Company", "sortable": true, "width": "250px"},
      {"key": "status", "label": "Status", "sortable": true, "width": "120px"},
      {"key": "industry", "label": "Industry", "sortable": true, "width": "180px"},
      {"key": "primary_contact_name", "label": "Contact", "sortable": true, "width": "180px"},
      {"key": "assigned_servicer", "label": "Servicer", "sortable": true, "width": "150px"},
      {"key": "revenue", "label": "Revenue", "sortable": true, "width": "130px", "format": "currency"},
      {"key": "updated_at", "label": "Last Updated", "sortable": true, "width": "150px", "format": "date"}
    ]
  }', true, 'b0000000-0000-0000-0000-000000000001', 'Default client list column layout'),

  -- Business rule: renewal window
  ('f2000000-0000-0000-0000-000000000007', 'business_rule', 'renewal_alerts', 1, '{
    "name": "Renewal Alert Window",
    "description": "Generate renewal alerts based on expiration dates",
    "rules": [
      {"daysBeforeExpiration": 120, "action": "create_notification", "priority": "low", "message": "Renewal coming up in 120 days"},
      {"daysBeforeExpiration": 90, "action": "create_notification", "priority": "normal", "message": "Renewal due in 90 days"},
      {"daysBeforeExpiration": 60, "action": "create_notification", "priority": "high", "message": "Renewal due in 60 days - action needed"},
      {"daysBeforeExpiration": 30, "action": "create_notification", "priority": "urgent", "message": "URGENT: Renewal due in 30 days"}
    ]
  }', true, 'b0000000-0000-0000-0000-000000000001', 'Renewal alert timing rules'),

  -- Validation rule: submission required fields
  ('f2000000-0000-0000-0000-000000000008', 'validation_rule', 'submission_validation', 1, '{
    "entity": "submission",
    "rules": [
      {"field": "client_id", "required": true, "message": "Client is required"},
      {"field": "effective_date", "required": true, "type": "date", "message": "Effective date is required"},
      {"field": "expiration_date", "required": true, "type": "date", "message": "Expiration date is required"},
      {"field": "lines_requested", "required": true, "minLength": 1, "message": "At least one line of business is required"},
      {"field": "expiration_date", "validation": "after:effective_date", "message": "Expiration date must be after effective date"}
    ]
  }', true, 'b0000000-0000-0000-0000-000000000001', 'Submission field validation rules')
ON CONFLICT (key, version) DO NOTHING;
