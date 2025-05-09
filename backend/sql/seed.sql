-- groups table
INSERT INTO groups (name) VALUES
('GroupA'),
('GroupB');

-- facilities table
INSERT INTO facilities (name, group_id) VALUES
('FacilityA', 1),
('FacilityB', 1),
('FacilityC', 2);

-- departments table
INSERT INTO departments (name, facility_id) VALUES
('InternalMedicine', 1),
('Surgery', 1),
('Pediatrics', 2),
('Dermatology', 3);

-- doctors table (with available_days: Mon-Fri)
INSERT INTO doctors (name, facility_id, department_id, available_days) VALUES
('TaroSato', 1, 1, ARRAY[1,2,3,4,5]),
('HanakoSuzuki', 1, 2, ARRAY[1,2,3,4,5]),
('KenichiTakahashi', 2, 3, ARRAY[1,2,3,4,5]),
('MisakiTanaka', 3, 4, ARRAY[1,2,3,4,5]);

-- admins table (password: password123)
INSERT INTO admins (name, email, password, role, group_id, facility_id) VALUES
('SuperAdmin', 'superadmin@example.com', '$2b$10$MwqIvJeGbGcNcy.P0UmcYev1qVzyzPdrwScNbdlksCQ9uMNfB1XQO', 'superadmin', 1, NULL),
('AdminA', 'adminA@example.com', '$2b$10$MwqIvJeGbGcNcy.P0UmcYev1qVzyzPdrwScNbdlksCQ9uMNfB1XQO', 'facilityadmin', 1, 1),
('AdminB', 'adminB@example.com', '$2b$10$MwqIvJeGbGcNcy.P0UmcYev1qVzyzPdrwScNbdlksCQ9uMNfB1XQO', 'facilityadmin', 2, 3);

-- users table (password: userpass123)
INSERT INTO users (name, email, password, phone, role, group_id) VALUES
('TestTaro', 'patientA@example.com', '$2b$10$EZqbrjK2TTiJZebqpduciOqGDKQwyDIkQjZ1yQ/LoKKmQ1ZhybNqK', '09011112222', 'user', 1),
('TestHanako', 'patientB@example.com', '$2b$10$EZqbrjK2TTiJZebqpduciOqGDKQwyDIkQjZ1yQ/LoKKmQ1ZhybNqK', '09033334444', 'user', 1),
('TestKenichi', 'patientC@example.com', '$2b$10$EZqbrjK2TTiJZebqpduciOqGDKQwyDIkQjZ1yQ/LoKKmQ1ZhybNqK', '09055556666', 'user', 2);
