ALTER TABLE `contacts`
  ADD COLUMN `show_on_dashboard` TINYINT(1) NOT NULL DEFAULT 1 AFTER `message`;

ALTER TABLE `reviews`
  ADD COLUMN `show_on_dashboard` TINYINT(1) NOT NULL DEFAULT 1 AFTER `is_active`;
