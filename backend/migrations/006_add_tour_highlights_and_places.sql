ALTER TABLE `tours`
  ADD COLUMN `highlights` JSON NULL AFTER `content`,
  ADD COLUMN `places` JSON NULL AFTER `highlights`;
