UPDATE "User"
SET "role" = 'SUPERADMIN'
WHERE "id" = (
  SELECT "id"
  FROM "User"
  WHERE "role" = 'ADMIN'
    AND NOT EXISTS (
      SELECT 1
      FROM "User"
      WHERE "role" = 'SUPERADMIN'
    )
  ORDER BY "createdAt" ASC
  LIMIT 1
);
