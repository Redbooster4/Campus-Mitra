CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE students(
	student_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	full_name VARCHAR(100) NOT NULL,
	phone VARCHAR(20) NOT NULL,
	email VARCHAR(150),
	dob DATE,
	category VARCHAR(30),
	is_duplicate_of UUID REFERENCES students(student_id),
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_students_phone ON students(phone);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_name_trgm ON students USING gin(full_name gin_trgm_ops);

CREATE TABLE departments(
	department_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);
CREATE TABLE counselors(
	counselor_id SERIAL PRIMARY KEY,
	department_id INTEGER REFERENCES departments(department_id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
	phone VARCHAR(20),
	email VARCHAR(150) NOT NULL UNIQUE
);
CREATE TABLE applications(
	application_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	student_id UUID REFERENCES students(student_id) ON DELETE CASCADE,
	status VARCHAR(30) DEFAULT 'Pending',
	created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE documents(
	document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	application_id UUID REFERENCES applications(application_id) ON DELETE CASCADE,
	document_name VARCHAR(100),
	file_path TEXT,
	status VARCHAR(30) DEFAULT 'Pending'
);
CREATE TABLE chat_history(
	chat_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	student_id UUID REFERENCES students(student_id) ON DELETE CASCADE,
	department_id INTEGER REFERENCES departments(department_id) ON DELETE SET NULL,
	user_message TEXT,
	ai_reply TEXT,
	created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE users_auth(
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    counselor_id INTEGER REFERENCES counselors(counselor_id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(student_id) ON DELETE CASCADE,

    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
	role VARCHAR(20) NOT NULL CHECK(role IN ('Admin', 'Counselor', 'Student')),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);