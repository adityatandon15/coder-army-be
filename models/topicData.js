const mongoose = require("mongoose");

const topicDataSchema = new mongoose.Schema({
  data: [
    {
      topic: {
        type: String,
        required: true,
      },
      hwLink: String,
      solLink: String,
      subTopic: [
        {
          name: {
            type: String,
            required: true,
          },
          hwLink: String,
          solLink: String,
          vidLink: String,
        },
      ],
    },
  ],
  name: String,
});

const TopicData = mongoose.model("TopicData", topicDataSchema);

module.exports = TopicData;
