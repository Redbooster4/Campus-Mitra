const pool = require("../config/db");

const getAnalyticsSummary = async(req, res) => {
    try{
        const appsResult = await pool.query(`SELECT COUNT(*) FROM applications WHERE status != 'Rejected'`);
        const totalApplications = parseInt(appsResult.rows[0].count, 10);

        const queriesResult = await pool.query(`SELECT COUNT(*) FROM chat_history`);
        const totalQueries = parseInt(queriesResult.rows[0].count, 10);

        const docsResult = await pool.query(`SELECT COUNT(*) FROM documents WHERE status = 'Pending'`);
        const pendingDocuments = parseInt(docsResult.rows[0].count, 10);

        const studentsResult = await pool.query(`SELECT COUNT(*) FROM students`);
        const totalStudents = parseInt(studentsResult.rows[0].count, 10);
        return res.status(200).json({
            success:true,
            data:{
                totalApplications,
                totalQueries,
                pendingDocuments,
                totalStudents
            }
        });
    }
    catch(error){
        console.error("Analytics Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch analytics summary"
        });
    }
};

module.exports={ getAnalyticsSummary };