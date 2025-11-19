# テーブル作成用SQL
-- 使用データベース
USE s2311585;

-- 地域名と分類のマッピングテーブル
DROP TABLE IF EXISTS area_mapping;
CREATE TABLE area_mapping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    area_name VARCHAR(50) NOT NULL,
    classification VARCHAR(20) NOT NULL -- 例: '西地区B'
);

-- ゴミ出しスケジュール
DROP TABLE IF EXISTS garbage_schedule;
CREATE TABLE garbage_schedule (
    id INT AUTO_INCREMENT PRIMARY KEY,
    classification VARCHAR(20) NOT NULL,       -- 例: '西地区B'
    date DATE NOT NULL,                         -- ゴミの収集日（例: 2025-08-04）
    gomi_type VARCHAR(50) NOT NULL              -- 例: 'スプレー', 'びん', '可燃ごみ'など
);

