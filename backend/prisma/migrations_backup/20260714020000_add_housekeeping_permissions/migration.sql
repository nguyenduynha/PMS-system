INSERT INTO "permissions" ("id", "module", "action", "name", "description", "created_at")
VALUES
  ('HOUSEKEEPING_VIEW', 'HOUSEKEEPING', 'VIEW', 'Xem Buồng phòng', 'Xem danh sách phòng cần vệ sinh', NOW()),
  ('HOUSEKEEPING_UPDATE', 'HOUSEKEEPING', 'UPDATE', 'Cập nhật vệ sinh', 'Bắt đầu và hoàn tất dọn phòng', NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r."id", p."id"
FROM "roles" r
CROSS JOIN "permissions" p
WHERE UPPER(r."code") IN ('ADMIN', 'SUPERADMIN', 'MANAGER')
  AND p."id" IN ('HOUSEKEEPING_VIEW', 'HOUSEKEEPING_UPDATE')
ON CONFLICT ("role_id", "permission_id") DO NOTHING;
