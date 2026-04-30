UPDATE "User"
SET "role" = 'SUPER_ADMIN'
WHERE "id" = (
  SELECT "id"
  FROM "User"
  WHERE NOT EXISTS (
    SELECT 1
    FROM "User"
    WHERE "role" = 'SUPER_ADMIN'
  )
  ORDER BY "createdAt" ASC
  LIMIT 1
);
