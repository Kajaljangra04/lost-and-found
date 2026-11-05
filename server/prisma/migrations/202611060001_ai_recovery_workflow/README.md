# AI recovery workflow migration

This is an additive PostgreSQL migration. It preserves the existing `users`,
`lostItems`, `foundItems`, `claims`, and `itemsCategories` tables.

Before deploying:
1. Back up the production database.
2. Confirm the existing Prisma schema has already been applied to the database.
3. Run `npx prisma migrate deploy` from `server/`.
4. Run `npx prisma generate`.

The repository did not contain a previous Prisma migrations history, so validate
the migration against a staging copy of the existing database before production.
