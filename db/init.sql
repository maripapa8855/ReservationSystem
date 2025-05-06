-- ===============================
-- 📌 テーブル定義（グループ対応版）
-- ===============================

-- グループ（法人）
CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- 管理者
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 施設
CREATE TABLE IF NOT EXISTS facilities (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 診療科
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id),
  facility_id INTEGER REFERENCES facilities(id),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 医師
CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id),
  facility_id INTEGER REFERENCES facilities(id),
  department_id INTEGER REFERENCES departments(id),
  name TEXT NOT NULL,
  available_days JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ユーザー（患者）
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 予約
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id),
  facility_id INTEGER REFERENCES facilities(id),
  department_id INTEGER REFERENCES departments(id),
  doctor_id INTEGER REFERENCES doctors(id),
  user_id INTEGER REFERENCES users(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  visit_type TEXT DEFAULT '新患',
  status TEXT DEFAULT '予約済',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 勤務シフト
CREATE TABLE IF NOT EXISTS shifts (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id),
  facility_id INTEGER REFERENCES facilities(id),
  department_id INTEGER REFERENCES departments(id),
  doctor_id INTEGER REFERENCES doctors(id),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_patients_per_slot INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 施設休診日
CREATE TABLE IF NOT EXISTS holidays (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id),
  facility_id INTEGER REFERENCES facilities(id),
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 診療科休診日
CREATE TABLE IF NOT EXISTS closed_days (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id),
  facility_id INTEGER REFERENCES facilities(id),
  department_id INTEGER REFERENCES departments(id),
  closed_date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 問診情報
CREATE TABLE IF NOT EXISTS questionnaires (
  reservation_id INTEGER PRIMARY KEY REFERENCES reservations(id) ON DELETE CASCADE,
  answers JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 問診設定
CREATE TABLE IF NOT EXISTS questionnaire_settings (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id),
  facility_id INTEGER REFERENCES facilities(id),
  department_id INTEGER REFERENCES departments(id),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 問診テンプレート
CREATE TABLE IF NOT EXISTS questionnaire_templates (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id),
  facility_id INTEGER REFERENCES facilities(id),
  department_id INTEGER REFERENCES departments(id),
  template_json JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 通知設定
CREATE TABLE IF NOT EXISTS notification_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  notify_email BOOLEAN DEFAULT true,
  notify_line BOOLEAN DEFAULT false,
  notify_sms BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 監査ログ
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id INTEGER,
  detail JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- 📌 初期データ
-- ===============================

INSERT INTO groups (name) VALUES
('東京医療法人'), ('関西メディカル')
ON CONFLICT DO NOTHING;

INSERT INTO admins (email, password) VALUES
('admin@example.com', '$2b$10$OQbRURFppKJm3EIk0mOBiOl/1Zt8MyApHTAaToZsp1FDN0MK5uw8q')
ON CONFLICT (email) DO NOTHING;

INSERT INTO facilities (group_id, name, location) VALUES
(1, '東京中央病院', '東京都千代田区1-1-1'),
(2, '大阪南病院', '大阪府大阪市中央区2-2-2')
ON CONFLICT DO NOTHING;

INSERT INTO departments (group_id, facility_id, name) VALUES
(1, 1, '内科'),
(1, 1, '外科'),
(2, 2, '小児科'),
(2, 2, '精神科')
ON CONFLICT DO NOTHING;

INSERT INTO doctors (group_id, facility_id, department_id, name, available_days) VALUES
(1, 1, 1, '佐藤太郎', '[1,2,3,4,5]'),
(1, 1, 2, '鈴木花子', '[1,2,3]'),
(2, 2, 3, '田中一郎', '[2,3,4]')
ON CONFLICT DO NOTHING;

INSERT INTO users (group_id, name, email, phone, password, role) VALUES
(1, 'テスト太郎', 'test@example.com', '09012345678', '$2b$10$9lYn0y/U/dLtx0BZvl.bw.0JnfEVb3x8EdYtWBlNBORPfTuU8cJh2', 'viewer')
ON CONFLICT (email) DO NOTHING;

INSERT INTO notification_settings (user_id)
SELECT id FROM users WHERE email = 'test@example.com'
ON CONFLICT DO NOTHING;
