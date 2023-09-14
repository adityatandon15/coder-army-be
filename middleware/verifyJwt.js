const { verifyJwt } = require("../utils/token");

const authenticateToken = (req, res, next) => {
  try {
    const token = req.headers["authorization"];
    if (token == null)
      return res.sendStatus(401).json({ message: "Please provide auth token" });
    verifyJwt(token);
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid Token", login: true });
  }
};

module.exports = {
  authenticateToken,
};
