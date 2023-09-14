const express = require("express");
const subtopicController = require("../controllers/subtopicController");
const { authenticateToken } = require("../middleware/verifyJwt");

const router = express.Router();

router.get("/", subtopicController.getAllSubtopics);
router.get("/:subtopicId", subtopicController.getCurrSubtopic);
router.post("/create", authenticateToken, subtopicController.createSubtopic);
router.patch(
  "/:subtopicId",
  authenticateToken,
  subtopicController.updateSubtopic
);
router.delete(
  "/:subtopicId",
  authenticateToken,
  subtopicController.deleteSubtopic
);
module.exports = router;
