const UserModel = require("../models/userModel");
const jwt = require("../utils/token");

const { createJwt } = jwt;

const allowedEmails = ["aditya.tandon1997@gmail.com", "support@coderarmy.in"];

const getAllUsers = async (req, res) => {
  try {
    const data = await UserModel.find({});
    res.json({ message: "Success", data: data });
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
};

const getUser = async (req, res) => {
  if (!allowedEmails.includes(req.body.email)) {
    res.status(500).json({ message: "Not Allowed", error: "Not Allowed" });
    return;
  }
  try {
    const data = await UserModel.findOne({
      email: req.body.email,
      password: req.body.password,
    });
    if (!data) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    return res.json({
      message: "login success",
      token: createJwt(data),
    });
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name = "", email = "", password = "" } = req.body || {};
    if (!allowedEmails.includes(email)) {
      res.status(500).json({ message: "Not Allowed", error: "Not Allowed" });
      return;
    }
    if (!name || !email || !password) {
      res.status(400).json({ message: "Empty Data field" });
    }

    const data = await UserModel.create({
      name,
      email,
      password,
    });

    res.json({
      message: "Success",
      data: "data saved successfully",
      token: createJwt(data),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  getUser,
};
