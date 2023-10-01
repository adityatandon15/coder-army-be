const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const articleRoutes = require("./routes/articlesRoutes");
const topicRoutes = require("./routes/topicRoutes");
const subtopicRoutes = require("./routes/subtopicRoutes");
const topicDataRoutes = require("./routes/topicDataRoutes");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.use("/", userRoutes);

app.use("/topics", topicRoutes);
app.use("/subtopics", subtopicRoutes);
app.use("/articles", articleRoutes);
app.use("/topic-data", topicDataRoutes);

app.get("/welcome", (req, res) => {
  res.status(200).send({ message: "Welcome to Coder Army" });
});

app.listen(PORT, () => {
  console.log("Server is running on port ", PORT);
  mongoose
    .connect(
      "mongodb+srv://adityatandon:mongodb@coderarmy.zqrpkde.mongodb.net",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    )
    .then(() => {
      console.log("DB Connected");
    })
    .catch((err) => console.error("DB Connection Error:", err));
});
