const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (userId, role, googleCalendarToken) => {
  try {
    if (!userId || !role) {
      throw new Error("userId and role are required to generate a token.");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is missing.");
    }

    return jwt.sign(
      { userId, role, googleCalendarToken },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Failed to generate token.");
  }
};

const hashPassword = async (password) => {
  try {
    if (!password) {
      throw new Error("Password is required to hash.");
    }

    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.error("Error hashing password:", error);
    throw new Error("Failed to hash password.");
  }
};

const comparePassword = async (password, hashedPassword) => {
  try {
    if (!password || !hashedPassword) {
      throw new Error(
        "Both password and hashedPassword are required for comparison."
      );
    }

    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw new Error("Failed to compare passwords.");
  }
};

module.exports = { generateToken, hashPassword, comparePassword };
