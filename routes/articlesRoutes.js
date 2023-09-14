const express = require("express");
const articleController = require("../controllers/articlesController");
const { authenticateToken } = require("../middleware/verifyJwt");
const router = express.Router();

router.get("/", articleController.getAllArticles);
router.get("/:articleId", articleController.getCurrArticle);
router.post("/create", authenticateToken, articleController.createArticle);
router.patch("/:articleId", authenticateToken, articleController.updateArticle);
router.delete(
  "/:articleId",
  authenticateToken,
  articleController.deleteArticle
);
module.exports = router;
