CREATE INDEX IF NOT EXISTS character_affiliations_world_character_primary_idx
  ON character_affiliations (world_id, character_id, is_primary);

CREATE INDEX IF NOT EXISTS character_relations_world_deleted_updated_idx
  ON character_relations (world_id, deleted_at, updated_at);

CREATE INDEX IF NOT EXISTS works_visibility_publish_view_updated_idx
  ON works (visibility, publish_status, view_count, updated_at);

CREATE INDEX IF NOT EXISTS work_chapters_work_deleted_number_idx
  ON work_chapters (work_id, deleted_at, number);
