const User = require("../models/user");
const {
  hashPassword,
  comparePassword,
  generateToken,
} = require("../utils/auth");

const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await hashPassword(password);
  const user = new User({ name, email, password: hashedPassword, role });
  await user.save();
  const token = generateToken(user._id, user.role);
  res.status(201).json({ token });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await comparePassword(password, user.password))) {
    return res.status(400).json({ message: "Invalid email or password." });
  }
  const token = generateToken(user._id, user.role, user.googleCalendarToken);
  res.json({ token });
};

module.exports = { register, login };
