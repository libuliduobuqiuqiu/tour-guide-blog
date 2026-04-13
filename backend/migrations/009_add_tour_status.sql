ALTER TABLE tours
  ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'published' AFTER location;
