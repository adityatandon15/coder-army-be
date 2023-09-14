const Subtopic = require("../models/subtopicModel");
const Topic = require("../models/topicModel"); // Import Topic model
const Article = require("../models/articlesModel");

// Create a variable to store all article IDs
let allArticleIds = [];

// Define a recursive function to perform post-order traversal and collect article IDs
async function collectArticleIds(node) {
  if (node?.subtopics?.length) {
    for (const subtopic of node.subtopics) {
      await collectArticleIds(subtopic);
    }
  }
  if (node.articles) {
    for (const article of node.articles) {
      if (!article.isTopic) {
        allArticleIds.push({ name: article.name, id: article.documentId });
      } else {
        // Get the subtopic by ID
        const subtopicId = article.documentId;
        const subtopic = await Subtopic.findOne({ _id: subtopicId });
        await collectArticleIds(subtopic);
      }
    }
  }
}

exports.getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find({}).populate("subtopics");

    res.json({ allArticleIds, topics });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching topics." });
  }
};

exports.getCurrTopic = async (req, res) => {
  try {
    allArticleIds = [];
    const { topicId } = req.params;
    const topics = await Topic.findById(topicId).populate("subtopics");
    await collectArticleIds(topics);
    res.json({ allArticleIds, topics });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching topics." });
  }
};

exports.createTopic = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Create a new topic
    const topic = await Topic.create({
      name,
      description,
      subtopics: [], // Initially, no subtopics
    });

    res.status(201).json(topic);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the topic." });
  }
};

exports.updateTopic = async (req, res) => {
  try {
    const { topicId } = req.params; // Extract topic ID from request parameters
    const { name, description } = req.body;

    // Find the topic by ID and update its details
    const updatedTopic = await Topic.findByIdAndUpdate(
      topicId,
      { name, description },
      { new: true } // Return the updated topic after the update
    );

    if (!updatedTopic) {
      return res.status(404).json({ error: "Topic not found." });
    }

    res.json(updatedTopic);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while updating the topic." });
  }
};
async function deleteSubtopicAndDescendants(subtopicId) {
  try {
    // Delete articles with matching parent value (subtopicId)
    await Article.deleteMany({ parent: subtopicId });

    // Find and delete subtopics with matching parentSubtopic value (subtopicId)
    const subtopicsToDelete = await Subtopic.find({
      parentSubtopic: subtopicId,
    });
    for (const subtopic of subtopicsToDelete) {
      await deleteSubtopicAndDescendants(subtopic._id);
      await Subtopic.deleteOne({ _id: subtopic._id });
    }
  } catch (error) {
    console.error("Error during deletion:", error);
  }
}

exports.deleteTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    // Find the topic by ID and delete it
    const deletedTopic = await Topic.findByIdAndDelete(topicId);

    if (!deletedTopic) {
      return res.status(404).json({ error: "Topic not found." });
    }

    // Delete subtopics and their descendants
    for (const subtopic of deletedTopic.subtopics) {
      await deleteSubtopicAndDescendants(subtopic._id);
      await Subtopic.deleteOne({ _id: subtopic._id });
    }

    res.json({
      message:
        "Topic, subtopics, and associated articles deleted successfully.",
    });
  } catch (error) {
    console.error("Deletion error:", error);
    res.status(500).json({
      error:
        "An error occurred while deleting the topic, subtopics, and associated articles.",
    });
  }
};
