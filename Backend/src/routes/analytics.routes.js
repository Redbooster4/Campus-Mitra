const express = require("express");
const router = express.Router();
const { getAnalyticsSummary } = require("../controllers/analytics.controller");

router.get("/summary", getAnalyticsSummary);

module.exports = router;