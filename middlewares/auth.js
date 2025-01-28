const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("Authentication required");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) throw new Error("User not found");

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate" });
  }
};

const isMentor = (req, res, next) => {
  if (req.user.role !== "mentor") {
    return res
      .status(403)
      .json({ error: "Access denied. Mentor rights required." });
  }
  next();
};

module.exports = { auth, isMentor };
