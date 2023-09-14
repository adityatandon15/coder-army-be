const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  title: { type: String, unique: true, index: true },
  content: String,
  parent: mongoose.Schema.Types.ObjectId,
  publish_date: Date,
  author: String,
});

const Article = mongoose.model("Article", articleSchema);

module.exports = Article;
