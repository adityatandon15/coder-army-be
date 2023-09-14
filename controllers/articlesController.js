const Article = require("../models/articlesModel");
const Subtopic = require("../models/subtopicModel");

exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find();
    res.json(articles);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching articles." });
  }
};
exports.getCurrArticle = async (req, res) => {
  try {
    const { articleId, name } = req.params;

    if (name) {
      const article = await Article.find({ title: name });
      res.json(article);
    } else {
      const article = await Article.findById(articleId);
      res.json(article);
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching subtopics." });
  }
};
exports.createArticle = async (req, res) => {
  try {
    const { title, content, parent, position } = req.body;

    // Create a new article
    const article = await Article.create({
      title,
      content,
      parent,
      publish_date: new Date(),
    });

    // Prepare the update operation for the parent subtopic's articles array
    const updateOperation = {
      $push: {
        articles: {
          $each: [{ documentId: article._id, name: title }],
        },
      },
    };

    if (typeof position === "number") {
      updateOperation.$push.articles.$position = position;
    }

    // Update the parent subtopic's articles array
    await Subtopic.findByIdAndUpdate(parent, updateOperation);

    res.status(201).json(article);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the article." });
  }
};
exports.updateArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { title, content, position } = req.body;

    // Find the article by ID
    const article = await Article.findById(articleId);

    if (!article) {
      return res.status(404).json({ error: "Article not found." });
    }

    // Get the parent subtopic
    const parent = article.parent;

    // Update the article details
    article.title = title || article.title;
    article.content = content || article.content;
    await article.save();

    // Update the article name in the parent subtopic's articles array
    await Subtopic.findOneAndUpdate(
      { _id: parent, "articles.documentId": articleId },
      { $set: { "articles.$.name": article.title } }
    );

    if (position !== undefined) {
      // Pull the article from the array
      await Subtopic.findByIdAndUpdate(parent, {
        $pull: { articles: { documentId: articleId } },
      });

      // Push the article to the new position
      await Subtopic.findByIdAndUpdate(parent, {
        $push: {
          articles: {
            $each: [{ documentId: articleId, name: article.title }],
            $position: position,
          },
        },
      });
    }

    res.status(200).json({ message: "Article updated successfully.", article });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while updating the article." });
  }
};
exports.deleteArticle = async (req, res) => {
  try {
    const { articleId } = req.params;

    // Find the article by ID and delete it
    const deletedArticle = await Article.findByIdAndDelete(articleId);

    if (!deletedArticle) {
      return res.status(404).json({ error: "Article not found." });
    }

    // If the article has a parent subtopic, remove it from the articles array
    if (deletedArticle.parent) {
      const parentSubtopic = await Subtopic.findById(deletedArticle.parent);

      if (parentSubtopic) {
        parentSubtopic.articles.pull({ documentId: articleId });
        await parentSubtopic.save();
      }
    }

    res.json({ message: "Article deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while deleting the article." });
  }
};
