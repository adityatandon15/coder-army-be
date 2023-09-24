const mongoose = require("mongoose");

const topicDataSchema = new mongoose.Schema({
  data: [
    {
      topic: {
        type: String,
        required: true,
      },
      subTopic: [
        {
          name: {
            type: String,
            required: true,
          },
          link: String,
        },
      ],
    },
  ],
  name: String,
});

const TopicData = mongoose.model("TopicData", topicDataSchema);

module.exports = TopicData;
