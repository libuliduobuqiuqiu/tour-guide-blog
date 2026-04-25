ALTER TABLE `tours`
  ADD COLUMN `currency_symbol` VARCHAR(20) NOT NULL DEFAULT '$' AFTER `places`,
  ADD COLUMN `is_active` TINYINT(1) NOT NULL DEFAULT 1 AFTER `sort_order`;

