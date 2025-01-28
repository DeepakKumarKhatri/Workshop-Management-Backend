const User = require("../models/user");
const {
  hashPassword,
  comparePassword,
  generateToken,
} = require("../utils/auth");

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    const token = generateToken(user._id, user.role);
    res.status(201).json({ token });
  } catch (error) {
    console.error("Error during registration:", error);

    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists." });
    }

    res.status(500).json({ message: "An error occurred during registration." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user._id, user.role, user.googleCalendarToken);
    res.json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "An error occurred during login." });
  }
};

module.exports = { register, login };
