const jwt = require("jsonwebtoken");

exports.createJwt = (payload) => {
  const token = jwt.sign(
    {
      ...payload,
    },
    "secretkeyappearshere",
    { expiresIn: "24h" }
  );
  return token;
};

exports.verifyJwt = (token) => {
  jwt.verify(token, "secretkeyappearshere", (err, payload) => {
    if (err) {
      throw new Error("Invalid Token");
    }
    return { success: true };
  });
};
