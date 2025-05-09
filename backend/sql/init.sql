-- Drop tables if exist
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS holidays;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS facilities;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS admins;

-- groups table
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- facilities table
CREATE TABLE facilities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    group_id INTEGER REFERENCES groups(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- departments table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    facility_id INTEGER REFERENCES facilities(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- doctors table
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    facility_id INTEGER REFERENCES facilities(id),
    department_id INTEGER REFERENCES departments(id),
    name TEXT NOT NULL,
    available_days INTEGER[] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- admins table
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    group_id INTEGER REFERENCES groups(id),
    facility_id INTEGER REFERENCES facilities(id),
    phone TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    phone TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    group_id INTEGER REFERENCES groups(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- reservations table
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    facility_id INTEGER REFERENCES facilities(id),
    department_id INTEGER REFERENCES departments(id),
    doctor_id INTEGER REFERENCES doctors(id),
    date DATE NOT NULL,
    time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- holidays table (updated structure; adjust if needed)
CREATE TABLE holidays (
    id SERIAL PRIMARY KEY,
    facility_id INTEGER REFERENCES facilities(id),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- notifications table (updated structure; adjust if needed)
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    facility_id INTEGER REFERENCES facilities(id),
    message TEXT NOT NULL,
    notify_email BOOLEAN DEFAULT FALSE,
    notify_line BOOLEAN DEFAULT FALSE,
    notify_sms BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
