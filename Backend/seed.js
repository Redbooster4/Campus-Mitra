require('dotenv').config();
const pool = require('./src/config/db.js');

async function seedDatabase() {
    try {
        console.log("Seeding database with dummy data...");

        // 1. Insert 5 Dummy Students
        const studentRes = await pool.query(`
            INSERT INTO students (full_name, phone, email, dob, category) VALUES
            ('Alice Smith', '555-0101', 'alice@example.com', '2002-05-14', 'General'),
            ('Bob Johnson', '555-0102', 'bob@example.com', '2001-08-22', 'OBC'),
            ('Charlie Brown', '555-0103', 'charlie@example.com', '2003-11-05', 'SC'),
            ('Diana Prince', '555-0104', 'diana@example.com', '2002-02-18', 'General'),
            ('Evan Wright', '555-0105', 'evan@example.com', '2000-12-12', 'General')
            RETURNING student_id;
        `);
        const students = studentRes.rows;
        console.log(`✅ Inserted ${students.length} students.`);

        // 2. Insert Applications for those students
        const appRes = await pool.query(`
            INSERT INTO applications (student_id, status) VALUES
            ($1, 'Pending'),
            ($2, 'Approved'),
            ($3, 'Rejected'),
            ($4, 'Pending'),
            ($5, 'Approved')
            RETURNING application_id;
        `, [students[0].student_id, students[1].student_id, students[2].student_id, students[3].student_id, students[4].student_id]);
        const apps = appRes.rows;
        console.log(`✅ Inserted ${apps.length} applications.`);

        // 3. Insert Documents for the applications (Some Pending, Some Verified)
        const docRes = await pool.query(`
            INSERT INTO documents (application_id, document_name, status) VALUES
            ($1, 'High School Transcript', 'Pending'),
            ($1, 'ID Proof', 'Pending'),
            ($2, 'High School Transcript', 'Verified'),
            ($2, 'ID Proof', 'Verified'),
            ($3, 'High School Transcript', 'Pending'),
            ($4, 'ID Proof', 'Verified')
            RETURNING document_id;
        `, [apps[0].application_id, apps[1].application_id, apps[3].application_id, apps[4].application_id]);
        console.log(`✅ Inserted ${docRes.rowCount} documents.`);

        // 4. Insert Chat History (Dummy AI Queries)
        const chatRes = await pool.query(`
            INSERT INTO chat_history (student_id, user_message, ai_reply) VALUES
            ($1, 'When is the admission deadline?', 'The deadline for Fall is August 31st.'),
            ($2, 'What are the hostel fees?', 'Hostel fees are $500 per semester.'),
            ($3, 'Do I need a letter of recommendation?', 'Yes, two letters are required.'),
            ($4, 'Where is the CS department?', 'It is located in Building B.'),
            ($1, 'Can I pay online?', 'Yes, online payment is available via the portal.'),
            ($2, 'Is there a library fee?', 'Library fees are included in tuition.'),
            ($5, 'How do I apply for scholarships?', 'You can apply via the financial aid portal.')
            RETURNING chat_id;
        `, [students[0].student_id, students[1].student_id, students[2].student_id, students[3].student_id, students[4].student_id]);
        console.log(`✅ Inserted ${chatRes.rowCount} chat queries.`);

        console.log("\n🎉 Database seeded successfully! Your dashboard will now show live metrics.");
        process.exit(0);

    } catch (err) {
        console.error("❌ Error seeding database:", err);
        process.exit(1);
    }
}

seedDatabase();
