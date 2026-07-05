-- AI Debugging Agent Database Schema
CREATE DATABASE IF NOT EXISTS debugging_agent;
USE debugging_agent;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User settings table
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

-- Debug history table (extended with new AI fields)
CREATE TABLE IF NOT EXISTS debug_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  language VARCHAR(50) NOT NULL,
  original_code TEXT NOT NULL,
  syntax_errors JSON,
  logical_errors JSON,
  bug_root_causes JSON,
  corrected_code TEXT,
  optimized_code TEXT,
  optimization_explanation TEXT,
  time_complexity VARCHAR(100),
  optimized_time_complexity VARCHAR(100),
  space_complexity VARCHAR(100),
  optimized_space_complexity VARCHAR(100),
  worst_case VARCHAR(200),
  average_case VARCHAR(200),
  best_case VARCHAR(200),
  complexity_explanation TEXT,
  generated_test_cases JSON,
  boundary_test_cases JSON,
  edge_test_cases JSON,
  large_input_test_cases JSON,
  expected_outputs JSON,
  line_explanations JSON,
  security_issues JSON,
  performance_issues JSON,
  best_practices JSON,
  learning_topics JSON,
  recommended_data_structures JSON,
  recommended_algorithms JSON,
  programming_topics JSON,
  interview_questions JSON,
  documentation JSON,
  analysis_score INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_debug_history_user_id (user_id),
  INDEX idx_debug_history_language (language),
  INDEX idx_debug_history_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
