const express = require("express");
const router = express.Router();
const {
    getAnalyticsSummary,
    getChatLogs,
    getStudentChatHistory,
    getFeedbackAnalytics
} = require("../controllers/analytics.controller");
const verifyToken = require("../middleware/auth.middleware");
const { authorizeRoles } = verifyToken;

// All analytics routes require authentication and Admin/Counselor role
router.use(verifyToken);
router.use(authorizeRoles("Admin", "Counselor"));

// 1. Aggregated KPI Summary
router.get("/summary", getAnalyticsSummary);

// 2. Feedback Analytics & Recent Submissions
router.get("/feedback", getFeedbackAnalytics);

// 3. Paginated & Filterable Q&A logs
router.get("/chats", getChatLogs);

// 4. Student-specific Q&A history
router.get("/students/:student_id/chats", getStudentChatHistory);

module.exports = router;
