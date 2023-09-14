const mongoose = require("mongoose");

const subtopicSchema = new mongoose.Schema({
  name: String,
  description: String,
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
  parentSubtopic: mongoose.Schema.Types.ObjectId,
  articles: [
    {
      documentId: mongoose.Schema.Types.ObjectId,
      name: String,
      isTopic: { type: Boolean, default: false },
    },
  ],
});

const Subtopic = mongoose.model("Subtopic", subtopicSchema);

module.exports = Subtopic;
