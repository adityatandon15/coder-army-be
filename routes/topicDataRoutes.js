const express = require("express");
const topicDataController = require("../controllers/topicDataController");
const { authenticateToken } = require("../middleware/verifyJwt");
const router = express.Router();

router.post("/create", authenticateToken, topicDataController.postTopicData);
router.get("/:name", topicDataController.getTopicData);
router.patch(
  "/update/:name",
  authenticateToken,
  topicDataController.updateTopicData
);
module.exports = router;
