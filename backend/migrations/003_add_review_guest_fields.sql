ALTER TABLE `reviews`
  ADD COLUMN `country` VARCHAR(100) NULL AFTER `username`,
  ADD COLUMN `review_date` DATE NULL AFTER `country`,
  ADD COLUMN `tour_route` VARCHAR(255) NULL AFTER `review_date`,
  ADD COLUMN `host` VARCHAR(100) NULL AFTER `tour_route`;
