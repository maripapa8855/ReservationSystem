-- seed.sql

INSERT INTO groups (name) VALUES ('GroupA'), ('GroupB');

INSERT INTO facilities (name, group_id) VALUES ('FacilityA', 1), ('FacilityB', 1), ('FacilityC', 2);

INSERT INTO departments (name, facility_id) VALUES
('Internal Medicine', 1),
('Surgery', 1),
('Pediatrics', 2),
('Dermatology', 2),
('Orthopedics', 3);

INSERT INTO doctors (name, department_id, facility_id) VALUES
('Taro Sato', 1, 1),
('Hanako Suzuki', 2, 1),
('Ichiro Tanaka', 3, 2),
('Jiro Yamada', 4, 2),
('Saburo Ito', 5, 3);

INSERT INTO users (name, email, password, phone, role, group_id, facility_id) VALUES
('Test User 1', 'user1@example.com', '$2b$10$QIiSIXzYMrWGyB6QU6xYtOYOEqgGRE8K8ZIWDzp1PqNxhFtTNNBri', '09011111111', 'user', 1, 1),
('Test User 2', 'user2@example.com', '$2b$10$QIiSIXzYMrWGyB6QU6xYtOYOEqgGRE8K8ZIWDzp1PqNxhFtTNNBri', '09022222222', 'user', 1, 2);

INSERT INTO admins (name, email, password, phone, role, group_id, facility_id) VALUES
('Super Admin', 'superadmin@example.com', '$2b$10$QIiSIXzYMrWGyB6QU6xYtOYOEqgGRE8K8ZIWDzp1PqNxhFtTNNBri', '09033333333', 'superadmin', 1, NULL),
('Group Admin', 'groupadmin@example.com', '$2b$10$QIiSIXzYMrWGyB6QU6xYtOYOEqgGRE8K8ZIWDzp1PqNxhFtTNNBri', '09044444444', 'groupadmin', 1, NULL),
('Facility Admin', 'facilityadmin@example.com', '$2b$10$QIiSIXzYMrWGyB6QU6xYtOYOEqgGRE8K8ZIWDzp1PqNxhFtTNNBri', '09055555555', 'facilityadmin', 1, 1);
