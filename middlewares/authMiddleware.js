const jwt = require("jsonwebtoken");

const authMiddleware = (roles) => (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Extract token
    const token = authHeader
      .replace(/^Bearer\s+Bearer\s+/, '')  // Remove double Bearer if present
      .replace(/^Bearer\s+/, '');          // Remove single Bearer if present

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (roles && !roles.includes(decoded.role)) {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }
    console.log(decoded)
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error details:", {
      errorName: error.name,
      errorMessage: error.message,
      token: req.header("Authorization")
    });
    res.status(400).json({ message: "Invalid token." });
  }
};

module.exports = { authMiddleware };