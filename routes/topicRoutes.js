const express = require("express");
const topicController = require("../controllers/topicController");
const { authenticateToken } = require("../middleware/verifyJwt");

const router = express.Router();

router.get("/", topicController.getAllTopics);
router.get("/:topicId", topicController.getCurrTopic);
router.post("/create", authenticateToken, topicController.createTopic);
router.patch("/:topicId", authenticateToken, topicController.updateTopic);
router.delete("/:topicId", authenticateToken, topicController.deleteTopic);
module.exports = router;
