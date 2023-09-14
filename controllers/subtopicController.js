const Subtopic = require("../models/subtopicModel");
const Topic = require("../models/topicModel"); // Import Topic model
const Article = require("../models/articlesModel");
exports.getAllSubtopics = async (req, res) => {
  try {
    const subtopics = await Subtopic.find({});
    res.json(subtopics);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching subtopics." });
  }
};
exports.getCurrSubtopic = async (req, res) => {
  try {
    const { subtopicId } = req.params;
    const subtopics = await Subtopic.findById(subtopicId);
    res.json(subtopics);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching subtopics." });
  }
};
exports.createSubtopic = async (req, res) => {
  try {
    const { name, description, parent, parentSubtopic, position } = req.body;

    // Create a new subtopic
    const subtopic = await Subtopic.create({
      name,
      description,
      parent,
      parentSubtopic,
      articles: [], // Initially, no articles
    });

    // Update the parent topic's subtopics array
    await Topic.findByIdAndUpdate(parent, {
      $push: { subtopics: subtopic._id },
    });

    if (!!parentSubtopic) {
      const pushOperation = {
        $push: {
          articles: {
            $each: [{ documentId: subtopic, name, isTopic: true }],
          },
        },
      };

      if (typeof position === "number") {
        pushOperation.$push.articles.$position = position; // Specify the desired position
      }

      await Subtopic.findByIdAndUpdate(parentSubtopic, pushOperation);
    }

    res.status(201).json(subtopic);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the subtopic." });
  }
};
exports.updateSubtopic = async (req, res) => {
  try {
    const { subtopicId } = req.params;
    const { name, description, positionSubtopic, positionTopic } = req.body;

    // Find the subtopic by ID
    const subtopic = await Subtopic.findById(subtopicId);

    if (!subtopic) {
      return res.status(404).json({ error: "Subtopic not found." });
    }

    // Get the parent subtopic
    const parentSubtopic = subtopic.parentSubtopic;

    // Update the subtopic details
    subtopic.name = name || subtopic.name;
    subtopic.description = description || subtopic.description;
    await subtopic.save();

    if (parentSubtopic) {
      // Update the subtopic name in the parent subtopic's articles array
      await Subtopic.findOneAndUpdate(
        { _id: parentSubtopic, "articles.documentId": subtopicId },
        { $set: { "articles.$.name": subtopic.name } }
      );

      if (positionSubtopic !== undefined) {
        // Pull the subtopic from the array
        await Subtopic.findByIdAndUpdate(parentSubtopic, {
          $pull: { articles: { documentId: subtopicId } },
        });

        // Push the subtopic to the new position
        await Subtopic.findByIdAndUpdate(parentSubtopic, {
          $push: {
            articles: {
              $each: [
                { documentId: subtopicId, name: subtopic.name, isTopic: true },
              ],
              $position: positionSubtopic,
            },
          },
        });
      }
    } else if (positionTopic !== undefined) {
      // Pull the subtopic from the parent topic's array
      const parentTopic = subtopic.parent;
      await Topic.findByIdAndUpdate(parentTopic, {
        $pull: { subtopics: subtopicId },
      });

      // Push the subtopic to the new position in the parent topic's array
      await Topic.findByIdAndUpdate(parentTopic, {
        $push: {
          subtopics: {
            $each: [subtopicId],
            $position: positionTopic,
          },
        },
      });
    }
    res
      .status(200)
      .json({ message: "Subtopic updated successfully.", subtopic });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while updating the subtopic." });
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

exports.deleteSubtopic = async (req, res) => {
  try {
    const { subtopicId } = req.params;

    // Find the subtopic by ID and delete it
    const deletedSubtopic = await Subtopic.findByIdAndDelete(subtopicId);

    if (!deletedSubtopic) {
      return res.status(404).json({ error: "Subtopic not found." });
    }

    // Delete articles with matching parent value (subtopicId)
    await Article.deleteMany({ parent: subtopicId });

    // Recursively delete subtopics and their descendants
    await deleteSubtopicAndDescendants(subtopicId);

    // If subtopic is in a parent topic's subtopics array, remove it
    if (deletedSubtopic.parent) {
      const parentTopic = await Topic.findById(deletedSubtopic.parent);

      if (parentTopic) {
        parentTopic.subtopics.pull(subtopicId);
        await parentTopic.save();
      }
    }
    if (deletedSubtopic.parentSubtopic) {
      const parentSubtopic = await Subtopic.findById(
        deletedSubtopic.parentSubtopic
      );

      if (parentSubtopic) {
        parentSubtopic.articles.pull({ documentId: subtopicId });
        await parentSubtopic.save();
      }
    }

    res.json({
      message:
        "Subtopic, associated articles, and related subtopics deleted successfully.",
    });
  } catch (error) {
    console.error("Deletion error:", error);
    res.status(500).json({
      error:
        "An error occurred while deleting the subtopic, associated articles, and related subtopics.",
    });
  }
};
