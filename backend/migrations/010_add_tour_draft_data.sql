ALTER TABLE tours
  ADD COLUMN draft_data JSON NULL AFTER status;
