# Add isSample columns

This additive PostgreSQL migration adds the isSample boolean field
to lostItems and foundItems.

Existing records receive the default value false.

The previously applied AI recovery workflow migration is intentionally
left unchanged.

Apply this migration only after reviewing and backing up the
production database.
