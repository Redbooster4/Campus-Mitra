const express = require("express");
const router = express.Router();
const {
    getAnalyticsSummary,
    getChatLogs,
    getStudentChatHistory,
    updateStudentFollowup,
    getFeedbackAnalytics
} = require("../controllers/analytics.controller");
const verifyToken = require("../middleware/auth.middleware");
const { authorizeRoles } = verifyToken;

router.use(verifyToken);
router.use(authorizeRoles("Admin", "Counselor"));

router.get("/summary", getAnalyticsSummary);

router.get("/feedback", getFeedbackAnalytics);

router.get("/chats", getChatLogs);

router.get("/students/:student_id/chats", getStudentChatHistory);

router.patch("/students/:student_id/followup", updateStudentFollowup);

module.exports = router;
