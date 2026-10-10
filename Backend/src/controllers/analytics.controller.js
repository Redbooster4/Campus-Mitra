const pool = require("../config/db");

/**
 * GET /api/admin/analytics/summary
 * Provides aggregated metrics for students and chat activity
 */
const getAnalyticsSummary = async (req, res) => {
    try {
        const statsQuery = `
            SELECT
                (SELECT COUNT(*)::int FROM students) AS total_students,
                (SELECT COUNT(*)::int FROM users_auth WHERE role = 'Student') AS total_student_accounts,
                (SELECT COUNT(*)::int FROM chat_history) AS total_questions_asked,
                (SELECT COUNT(DISTINCT student_id)::int FROM chat_history WHERE student_id IS NOT NULL) AS active_students_count,
                (SELECT COUNT(*)::int FROM chat_history WHERE student_id IS NULL) AS guest_questions_count,
                (SELECT COUNT(*)::int FROM chat_history WHERE created_at >= NOW() - INTERVAL '24 HOURS') AS questions_last_24h,
                (SELECT COUNT(*)::int FROM chat_history WHERE created_at >= NOW() - INTERVAL '7 DAYS') AS questions_last_7d;
        `;

        const departmentBreakdownQuery = `
            SELECT 
                COALESCE(d.name, 'General / Inquiries') AS department_name,
                COUNT(c.chat_id)::int AS question_count
            FROM chat_history c
            LEFT JOIN departments d ON c.department_id = d.department_id
            GROUP BY d.name
            ORDER BY question_count DESC;
        `;

        const [statsResult, deptResult] = await Promise.all([
            pool.query(statsQuery),
            pool.query(departmentBreakdownQuery)
        ]);

        const stats = statsResult.rows[0];

        return res.status(200).json({
            success: true,
            message: "Analytics summary retrieved successfully",
            data: {
                students: {
                    totalStudents: stats.total_students,
                    registeredUserAccounts: stats.total_student_accounts,
                    activeStudentsAskingQuestions: stats.active_students_count
                },
                questions: {
                    totalQuestionsAsked: stats.total_questions_asked,
                    guestQuestions: stats.guest_questions_count,
                    questionsLast24Hours: stats.questions_last_24h,
                    questionsLast7Days: stats.questions_last_7d
                },
                departmentBreakdown: deptResult.rows
            }
        });
    } catch (error) {
        console.error("[Analytics Summary Error]:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve analytics summary",
            error: error.message
        });
    }
};

/**
 * GET /api/admin/analytics/chats
 * Provides paginated, searchable, and filterable questions and answers
 */
const getChatLogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            student_id,
            department_id,
            startDate,
            endDate
        } = req.query;

        const parsedPage = Math.max(1, parseInt(page, 10) || 1);
        const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const offset = (parsedPage - 1) * parsedLimit;

        const conditions = [];
        const params = [];
        let paramIndex = 1;

        if (search && search.trim() !== "") {
            conditions.push(`(c.user_message ILIKE $${paramIndex} OR c.ai_reply ILIKE $${paramIndex})`);
            params.push(`%${search.trim()}%`);
            paramIndex++;
        }

        if (student_id) {
            conditions.push(`c.student_id = $${paramIndex}`);
            params.push(student_id);
            paramIndex++;
        }

        if (department_id) {
            conditions.push(`c.department_id = $${paramIndex}`);
            params.push(department_id);
            paramIndex++;
        }

        if (startDate) {
            conditions.push(`c.created_at >= $${paramIndex}::timestamp`);
            params.push(startDate);
            paramIndex++;
        }

        if (endDate) {
            conditions.push(`c.created_at <= $${paramIndex}::timestamp`);
            params.push(endDate);
            paramIndex++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        // Query total count for pagination metadata
        const countQuery = `
            SELECT COUNT(*)::int AS total
            FROM chat_history c
            ${whereClause}
        `;

        // Query chats with student and department metadata
        const dataQuery = `
            SELECT
                c.chat_id,
                c.user_message AS question,
                c.ai_reply AS answer,
                c.created_at,
                c.department_id,
                d.name AS department_name,
                c.student_id,
                s.full_name AS student_name,
                s.email AS student_email,
                s.phone AS student_phone
            FROM chat_history c
            LEFT JOIN students s ON c.student_id = s.student_id
            LEFT JOIN departments d ON c.department_id = d.department_id
            ${whereClause}
            ORDER BY c.created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
        `;

        const [countResult, dataResult] = await Promise.all([
            pool.query(countQuery, params),
            pool.query(dataQuery, [...params, parsedLimit, offset])
        ]);

        const totalRecords = countResult.rows[0]?.total || 0;
        const totalPages = Math.ceil(totalRecords / parsedLimit);

        const formattedChats = dataResult.rows.map((row) => ({
            chat_id: row.chat_id,
            question: row.question,
            answer: row.answer,
            created_at: row.created_at,
            department: row.department_id
                ? {
                      department_id: row.department_id,
                      name: row.department_name
                  }
                : null,
            student: row.student_id
                ? {
                      student_id: row.student_id,
                      full_name: row.student_name,
                      email: row.student_email,
                      phone: row.student_phone
                  }
                : null
        }));

        return res.status(200).json({
            success: true,
            pagination: {
                totalRecords,
                page: parsedPage,
                limit: parsedLimit,
                totalPages,
                hasNextPage: parsedPage < totalPages,
                hasPrevPage: parsedPage > 1
            },
            chats: formattedChats
        });
    } catch (error) {
        console.error("[Chat Logs Error]:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve chat logs",
            error: error.message
        });
    }
};

/**
 * GET /api/admin/analytics/students/:student_id/chats
 * Provides all questions and answers asked by a specific student
 */
const getStudentChatHistory = async (req, res) => {
    try {
        const { student_id } = req.params;

        if (!student_id) {
            return res.status(400).json({
                success: false,
                message: "student_id parameter is required"
            });
        }

        // Fetch student details
        const studentQuery = `
            SELECT student_id, full_name, email, phone, category, created_at
            FROM students
            WHERE student_id = $1;
        `;
        const studentResult = await pool.query(studentQuery, [student_id]);

        if (studentResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Fetch chat interactions
        const chatsQuery = `
            SELECT
                c.chat_id,
                c.user_message AS question,
                c.ai_reply AS answer,
                c.created_at,
                d.name AS department_name
            FROM chat_history c
            LEFT JOIN departments d ON c.department_id = d.department_id
            WHERE c.student_id = $1
            ORDER BY c.created_at ASC;
        `;
        const chatsResult = await pool.query(chatsQuery, [student_id]);

        return res.status(200).json({
            success: true,
            student: studentResult.rows[0],
            totalQuestions: chatsResult.rows.length,
            chats: chatsResult.rows
        });
    } catch (error) {
        console.error("[Student Chat History Error]:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve student chat history",
            error: error.message
        });
    }
};

module.exports = {
    getAnalyticsSummary,
    getChatLogs,
    getStudentChatHistory
};
