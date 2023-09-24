const TopicData = require("../models/topicData");

exports.postTopicData = async (req, res) => {
  //if more fields than dsa then make this generic
  try {
    const topicData = await TopicData.create({
      data: req.body.dsa,
      name: req.body.name,
    });

    res.status(201).json(topicData);
  } catch (error) {
    res.status(500).json({
      error: error,
      message: "An error occurred while creating the topic Data.",
    });
  }
};

exports.getTopicData = async (req, res) => {
  try {
    const topicData = await TopicData.find({ name: req.params.name });
    res.status(201).json(topicData);
  } catch (error) {
    res.status(500).json({
      error: error,
      message: "An error occurred while fetching the topic Data.",
    });
  }
};

exports.updateTopicData = async (req, res) => {
  try {
    const { name } = req.params;
    const { dsa } = req.body;

    const topicData = await TopicData.findOneAndUpdate({ name }, { data: dsa });

    if (!topicData) {
      return res.status(404).json({
        message: "Topic Data not found",
      });
    }

    res.status(200).json(topicData);
  } catch (error) {
    res.status(500).json({
      error: error,
      message: "An error occurred while updating the topic Data.",
    });
  }
};
