const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  description: String,
  subtopics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subtopic" }],
});

const Topic = mongoose.model("Topic", topicSchema);

module.exports = Topic;
