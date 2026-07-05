noUSE debugging_agent;

DROP PROCEDURE IF EXISTS add_col;
DELIMITER //
CREATE PROCEDURE add_col(IN tbl VARCHAR(64), IN col VARCHAR(64), IN def TEXT)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = tbl AND column_name = col
  ) THEN
    SET @s = CONCAT('ALTER TABLE `', tbl, '` ADD COLUMN `', col, '` ', def);
    PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;
  END IF;
END//
DELIMITER ;

CALL add_col('users', 'phone',              'VARCHAR(20) DEFAULT NULL');
CALL add_col('users', 'role',               'VARCHAR(100) DEFAULT NULL');
CALL add_col('users', 'college_company',    'VARCHAR(200) DEFAULT NULL');
CALL add_col('users', 'experience_level',   'VARCHAR(50) DEFAULT NULL');
CALL add_col('users', 'preferred_language', 'VARCHAR(50) DEFAULT NULL');
CALL add_col('users', 'bio',                'TEXT DEFAULT NULL');
CALL add_col('users', 'github_url',         'VARCHAR(255) DEFAULT NULL');

DROP PROCEDURE IF EXISTS add_col;
SELECT 'User fields migration complete' AS status;
