-- Migration: Add new columns for extended AI analysis features
USE debugging_agent;

-- Procedure to add column if it doesn't exist
DROP PROCEDURE IF EXISTS add_column_if_missing;

DELIMITER //
CREATE PROCEDURE add_column_if_missing(
  IN p_table VARCHAR(64),
  IN p_column VARCHAR(64),
  IN p_definition TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = p_table
      AND column_name = p_column
  ) THEN
    SET @sql = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN `', p_column, '` ', p_definition);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END//
DELIMITER ;

CALL add_column_if_missing('debug_history', 'bug_root_causes', 'JSON');
CALL add_column_if_missing('debug_history', 'optimized_time_complexity', 'VARCHAR(100)');
CALL add_column_if_missing('debug_history', 'optimized_space_complexity', 'VARCHAR(100)');
CALL add_column_if_missing('debug_history', 'worst_case', 'VARCHAR(200)');
CALL add_column_if_missing('debug_history', 'average_case', 'VARCHAR(200)');
CALL add_column_if_missing('debug_history', 'best_case', 'VARCHAR(200)');
CALL add_column_if_missing('debug_history', 'complexity_explanation', 'TEXT');
CALL add_column_if_missing('debug_history', 'large_input_test_cases', 'JSON');
CALL add_column_if_missing('debug_history', 'line_explanations', 'JSON');
CALL add_column_if_missing('debug_history', 'security_issues', 'JSON');
CALL add_column_if_missing('debug_history', 'performance_issues', 'JSON');
CALL add_column_if_missing('debug_history', 'recommended_data_structures', 'JSON');
CALL add_column_if_missing('debug_history', 'recommended_algorithms', 'JSON');
CALL add_column_if_missing('debug_history', 'programming_topics', 'JSON');
CALL add_column_if_missing('debug_history', 'interview_questions', 'JSON');
CALL add_column_if_missing('debug_history', 'documentation', 'JSON');
CALL add_column_if_missing('debug_history', 'analysis_score', 'INT DEFAULT 100');

DROP PROCEDURE IF EXISTS add_column_if_missing;

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  theme VARCHAR(20) DEFAULT 'light',
  editor_theme VARCHAR(50) DEFAULT 'vs-dark',
  font_size INT DEFAULT 14,
  language VARCHAR(20) DEFAULT 'en',
  autosave TINYINT(1) DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
