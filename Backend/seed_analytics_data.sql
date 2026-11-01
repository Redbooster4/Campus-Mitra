-- Seed script for Campus Mitra Analytics & Admin Dashboard

-- 1. Departments
INSERT INTO departments (name)
VALUES 
    ('Computer Engineering'),
    ('Information Technology'),
    ('Artificial Intelligence & Data Science'),
    ('Mechanical Engineering'),
    ('Electrical Engineering'),
    ('Civil Engineering')
ON CONFLICT (name) DO NOTHING;

-- 2. Clean temporary staging and insert Students
DO $$
DECLARE
    dept_ce INT;
    dept_it INT;
    dept_ai INT;
    dept_mech INT;
    dept_elec INT;
    dept_civil INT;
    
    s_id UUID;
    app_id UUID;
    chat_uid UUID;
    pwd_hash TEXT := crypt('password123', gen_salt('bf'));
BEGIN
    SELECT department_id INTO dept_ce FROM departments WHERE name = 'Computer Engineering' LIMIT 1;
    SELECT department_id INTO dept_it FROM departments WHERE name = 'Information Technology' LIMIT 1;
    SELECT department_id INTO dept_ai FROM departments WHERE name = 'Artificial Intelligence & Data Science' LIMIT 1;
    SELECT department_id INTO dept_mech FROM departments WHERE name = 'Mechanical Engineering' LIMIT 1;
    SELECT department_id INTO dept_elec FROM departments WHERE name = 'Electrical Engineering' LIMIT 1;
    SELECT department_id INTO dept_civil FROM departments WHERE name = 'Civil Engineering' LIMIT 1;

    -- Student 1
    INSERT INTO students (full_name, phone, email, category, target_branch, entrance_score, callback_requested, followup_status, notes)
    VALUES ('Aarav Patel', '9820011223', 'aarav.patel@example.com', 'General', 'Computer Engineering', '98.40', FALSE, 'Enrolled', 'Document verification completed. Merit list 1.')
    RETURNING student_id INTO s_id;

    INSERT INTO users_auth (student_id, username, password_hash, role)
    VALUES (s_id, 'aarav_p', pwd_hash, 'Student')
    ON CONFLICT (username) DO NOTHING;

    INSERT INTO applications (student_id, status) VALUES (s_id, 'Approved') RETURNING application_id INTO app_id;
    INSERT INTO documents (application_id, document_name, file_path, status) VALUES (app_id, 'HSC Marksheet', '/uploads/aarav_hsc.pdf', 'Verified');
    INSERT INTO documents (application_id, document_name, file_path, status) VALUES (app_id, 'MHT-CET Scorecard', '/uploads/aarav_cet.pdf', 'Verified');

    -- Student 2
    INSERT INTO students (full_name, phone, email, category, target_branch, entrance_score, callback_requested, followup_status, notes)
    VALUES ('Diya Sharma', '9820022334', 'diya.sharma@example.com', 'OBC', 'Information Technology', '96.25', TRUE, 'Pending', 'Inquired about fee concession and hostel facility.')
    RETURNING student_id INTO s_id;

    INSERT INTO users_auth (student_id, username, password_hash, role)
    VALUES (s_id, 'diya_s', pwd_hash, 'Student')
    ON CONFLICT (username) DO NOTHING;

    INSERT INTO applications (student_id, status) VALUES (s_id, 'Pending') RETURNING application_id INTO app_id;
    INSERT INTO documents (application_id, document_name, file_path, status) VALUES (app_id, 'Caste Certificate', '/uploads/diya_caste.pdf', 'Pending');
    INSERT INTO documents (application_id, document_name, file_path, status) VALUES (app_id, 'Non-Creamy Layer', '/uploads/diya_ncl.pdf', 'Pending');

    -- Student 3
    INSERT INTO students (full_name, phone, email, category, target_branch, entrance_score, callback_requested, followup_status, notes)
    VALUES ('Rohan Mehta', '9820033445', 'rohan.mehta@example.com', 'General', 'Artificial Intelligence & Data Science', '97.10', TRUE, 'Contacted', 'Counselor discussed curriculum and labs.')
    RETURNING student_id INTO s_id;

    INSERT INTO users_auth (student_id, username, password_hash, role)
    VALUES (s_id, 'rohan_m', pwd_hash, 'Student')
    ON CONFLICT (username) DO NOTHING;

    INSERT INTO applications (student_id, status) VALUES (s_id, 'Pending') RETURNING application_id INTO app_id;
    INSERT INTO documents (application_id, document_name, file_path, status) VALUES (app_id, 'Domicile Certificate', '/uploads/rohan_domicile.pdf', 'Pending');

    -- Student 4
    INSERT INTO students (full_name, phone, email, category, target_branch, entrance_score, callback_requested, followup_status, notes)
    VALUES ('Ananya Joshi', '9820044556', 'ananya.joshi@example.com', 'General', 'Mechanical Engineering', '89.50', FALSE, 'Resolved', 'Provided details on automotive workshop.')
    RETURNING student_id INTO s_id;

    INSERT INTO users_auth (student_id, username, password_hash, role)
    VALUES (s_id, 'ananya_j', pwd_hash, 'Student')
    ON CONFLICT (username) DO NOTHING;

    -- Student 5
    INSERT INTO students (full_name, phone, email, category, target_branch, entrance_score, callback_requested, followup_status, notes)
    VALUES ('Siddharth Rao', '9820055667', 'siddharth.rao@example.com', 'General', 'Computer Engineering', '95.00', FALSE, 'Pending', NULL)
    RETURNING student_id INTO s_id;

    INSERT INTO users_auth (student_id, username, password_hash, role)
    VALUES (s_id, 'sid_rao', pwd_hash, 'Student')
    ON CONFLICT (username) DO NOTHING;

    INSERT INTO applications (student_id, status) VALUES (s_id, 'Pending') RETURNING application_id INTO app_id;
    INSERT INTO documents (application_id, document_name, file_path, status) VALUES (app_id, 'HSC Marksheet', '/uploads/sid_hsc.pdf', 'Verified');
    INSERT INTO documents (application_id, document_name, file_path, status) VALUES (app_id, 'Leaving Certificate', '/uploads/sid_lc.pdf', 'Pending');

    -- Student 6
    INSERT INTO students (full_name, phone, email, category, target_branch, entrance_score, callback_requested, followup_status, notes)
    VALUES ('Tanvi Kulkarni', '9820066778', 'tanvi.kulkarni@example.com', 'General', 'Information Technology', '94.75', FALSE, 'Enrolled', 'Enrolled in round 1.')
    RETURNING student_id INTO s_id;

    INSERT INTO users_auth (student_id, username, password_hash, role)
    VALUES (s_id, 'tanvi_k', pwd_hash, 'Student')
    ON CONFLICT (username) DO NOTHING;

    INSERT INTO applications (student_id, status) VALUES (s_id, 'Approved') RETURNING application_id INTO app_id;
    INSERT INTO documents (application_id, document_name, file_path, status) VALUES (app_id, 'Marksheet', '/uploads/tanvi_marks.pdf', 'Verified');

    -- Student 7
    INSERT INTO students (full_name, phone, email, category, target_branch, entrance_score, callback_requested, followup_status, notes)
    VALUES ('Aditya Deshmukh', '9820077889', 'aditya.deshmukh@example.com', 'EWS', 'Electrical Engineering', '91.20', TRUE, 'Contacted', 'Scheduled meeting for Monday.')
    RETURNING student_id INTO s_id;

    INSERT INTO users_auth (student_id, username, password_hash, role)
    VALUES (s_id, 'aditya_d', pwd_hash, 'Student')
    ON CONFLICT (username) DO NOTHING;

    INSERT INTO applications (student_id, status) VALUES (s_id, 'Pending') RETURNING application_id INTO app_id;
    INSERT INTO documents (application_id, document_name, file_path, status) VALUES (app_id, 'EWS Certificate', '/uploads/aditya_ews.pdf', 'Pending');

    -- Student 8
    INSERT INTO students (full_name, phone, email, category, target_branch, entrance_score, callback_requested, followup_status, notes)
    VALUES ('Rahul Gupta', '9820088990', 'rahul.gupta@example.com', 'General', 'Computer Engineering', '99.15', FALSE, 'Enrolled', 'Top ranker admission.')
    RETURNING student_id INTO s_id;

    INSERT INTO users_auth (student_id, username, password_hash, role)
    VALUES (s_id, 'rahul_g', pwd_hash, 'Student')
    ON CONFLICT (username) DO NOTHING;

    INSERT INTO applications (student_id, status) VALUES (s_id, 'Approved') RETURNING application_id INTO app_id;
    INSERT INTO documents (application_id, document_name, file_path, status) VALUES (app_id, 'Scorecard', '/uploads/rahul_score.pdf', 'Verified');

    -- Unregistered Students (leads who haven't created a login account yet)
    INSERT INTO students (full_name, phone, email, category, target_branch, entrance_score, callback_requested, followup_status, notes)
    VALUES 
        ('Priya Nair', '9820099001', 'priya.nair@example.com', 'General', 'Civil Engineering', '84.30', FALSE, 'Pending', 'Guest visitor interested in surveying lab'),
        ('Kunal Verma', '9820099002', 'kunal.verma@example.com', 'SC', 'Mechanical Engineering', '87.60', TRUE, 'Pending', 'Needs fee waiver verification'),
        ('Riya Shah', '9820099003', 'riya.shah@example.com', 'General', 'Artificial Intelligence & Data Science', '93.80', FALSE, 'Resolved', 'Attended open day seminar'),
        ('Vikram Chauhan', '9820099004', 'vikram.c@example.com', 'ST', 'Civil Engineering', '82.40', TRUE, 'Pending', 'Inquired via chatbot callback');

    -- Insert Chat History entries with timestamps across 24h, 7d, and older
    -- Past 24 hours
    INSERT INTO chat_history (student_id, department_id, user_message, ai_reply, needs_followup, created_at)
    VALUES
        (s_id, dept_ce, 'What are the cutoff percentiles for Computer Engineering CAP Round 1?', 'For Computer Engineering, the Round 1 General cutoff was 97.8 percentile.', FALSE, NOW() - INTERVAL '2 hours'),
        (s_id, dept_ce, 'Can I get scholarship with 98+ percentile in CE?', 'Yes, students scoring above 98 percentile are eligible for the merit scholarship and TFWS seats.', FALSE, NOW() - INTERVAL '4 hours'),
        (NULL, dept_it, 'What is the average placement package for IT branch?', 'The average placement package for IT for the 2025-26 cycle was 8.2 LPA.', FALSE, NOW() - INTERVAL '6 hours'),
        (NULL, dept_ai, 'Does AI & DS branch have NVIDIA GPU labs?', 'Yes, the college has dedicated NVIDIA DGX GPU compute clusters for AI/DS research.', FALSE, NOW() - INTERVAL '8 hours'),
        (NULL, dept_mech, 'Are internships mandatory in mechanical engineering?', 'Yes, an 8-week industrial internship during the 7th semester is mandatory.', FALSE, NOW() - INTERVAL '12 hours');

    -- 2 to 7 days ago
    INSERT INTO chat_history (student_id, department_id, user_message, ai_reply, needs_followup, created_at)
    VALUES
        (s_id, dept_ce, 'What coding clubs are active on campus?', 'Active clubs include ACM Student Chapter, Google Developer Groups, and CodeChef Campus Chapter.', FALSE, NOW() - INTERVAL '3 days'),
        (NULL, dept_ce, 'What is the syllabus for 1st year engineering?', 'First year has common foundational subjects: Applied Physics, Math, Engineering Mechanics, and C Programming.', FALSE, NOW() - INTERVAL '3 days'),
        (NULL, dept_it, 'Is attendance strictly 75% for IT students?', 'Yes, University guidelines mandate 75% minimum aggregate attendance.', FALSE, NOW() - INTERVAL '4 days'),
        (NULL, dept_it, 'What are the elective tracks available in IT?', 'Electives include Cloud Computing, Cybersecurity, DevOps, and Full-Stack Web Development.', FALSE, NOW() - INTERVAL '4 days'),
        (NULL, dept_ai, 'How is AI & DS different from Computer Engineering?', 'AI & DS focuses deeply on statistics, machine learning, computer vision, and NLP alongside core CS fundamentals.', FALSE, NOW() - INTERVAL '5 days'),
        (NULL, dept_mech, 'Which CAD/CAM software are taught in Mechanical?', 'Students are trained in AutoCAD, SolidWorks, CATIA, and ANSYS.', FALSE, NOW() - INTERVAL '5 days'),
        (NULL, dept_elec, 'What are career opportunities after Electrical Engineering?', 'Graduates enter power grid operations, EV powertrain design, renewable energy, and embedded systems.', FALSE, NOW() - INTERVAL '6 days'),
        (NULL, dept_civil, 'Does Civil department have surveying equipment on site?', 'Yes, modern Total Stations, GPS surveying equipment, and testing labs are available on campus.', FALSE, NOW() - INTERVAL '6 days');

    -- Older (> 7 days ago)
    INSERT INTO chat_history (student_id, department_id, user_message, ai_reply, needs_followup, created_at)
    VALUES
        (s_id, dept_ce, 'When do college admissions start for diploma to degree (DSE)?', 'Direct Second Year (DSE) registration starts after final semester diploma results are declared.', FALSE, NOW() - INTERVAL '10 days'),
        (NULL, dept_ce, 'What documents are required for CAP round document verification?', 'You will need CET score card, HSC marksheet, SSC marksheet, Domicile certificate, and Category certificate if applicable.', FALSE, NOW() - INTERVAL '12 days'),
        (NULL, dept_it, 'Is there college bus transportation available?', 'Yes, college buses operate on major routes across the city.', FALSE, NOW() - INTERVAL '14 days'),
        (NULL, dept_ai, 'What is the intake capacity for AI & Data Science?', 'The approved intake for AI & Data Science is 120 seats per batch.', FALSE, NOW() - INTERVAL '15 days'),
        (NULL, dept_elec, 'Are there solar lab facilities for research?', 'Yes, the department maintains a 50kW rooftop solar research and testing facility.', FALSE, NOW() - INTERVAL '18 days');

    -- Insert feedback ratings
    INSERT INTO chat_feedback (rating, user_message, ai_reply, created_at)
    VALUES
        (5, 'Cutoff query answered promptly', 'Accurate cutoff data provided', NOW() - INTERVAL '2 hours'),
        (5, 'Great details about AI/DS curriculum', 'Answered clearly with lab information', NOW() - INTERVAL '8 hours'),
        (4, 'Clear guidance on documents needed', 'Document checklist provided', NOW() - INTERVAL '1 day'),
        (5, 'Very fast and accurate', 'Average placement info provided', NOW() - INTERVAL '2 days'),
        (4, 'Helpful answer about robotics club', 'Robotics details provided', NOW() - INTERVAL '3 days'),
        (3, 'Good, but would like direct phone contact', 'Offered callback option', NOW() - INTERVAL '5 days'),
        (5, 'Excellent support bot', 'Thank you for your feedback', NOW() - INTERVAL '7 days');

END $$;
