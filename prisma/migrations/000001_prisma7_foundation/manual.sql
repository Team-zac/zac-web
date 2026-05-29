CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE UNIQUE INDEX IF NOT EXISTS world_members_one_owner_per_world
  ON world_members (world_id)
  WHERE role = 'OWNER';

CREATE UNIQUE INDEX IF NOT EXISTS character_affiliations_one_current_primary
  ON character_affiliations (character_id)
  WHERE is_primary = true AND status = 'CURRENT';

CREATE UNIQUE INDEX IF NOT EXISTS character_affiliations_one_current_pair
  ON character_affiliations (character_id, affiliation_id)
  WHERE status = 'CURRENT';

ALTER TABLE worlds
  ADD CONSTRAINT worlds_view_count_nonnegative CHECK (view_count >= 0);

ALTER TABLE characters
  ADD CONSTRAINT characters_view_count_nonnegative CHECK (view_count >= 0);

ALTER TABLE affiliations
  ADD CONSTRAINT affiliations_view_count_nonnegative CHECK (view_count >= 0);

ALTER TABLE works
  ADD CONSTRAINT works_view_count_nonnegative CHECK (view_count >= 0);
