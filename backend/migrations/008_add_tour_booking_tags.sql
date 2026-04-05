ALTER TABLE tours
  ADD COLUMN booking_tag_1 VARCHAR(255) NULL AFTER places,
  ADD COLUMN booking_tag_2 VARCHAR(255) NULL AFTER booking_tag_1,
  ADD COLUMN max_bookings INT NOT NULL DEFAULT 0 AFTER booking_tag_2,
  ADD COLUMN availability JSON NULL AFTER max_bookings;
