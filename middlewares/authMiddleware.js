const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
  verifyToken: (req, res, next) => {
    console.log("Cookies:", req.cookies);
    const token = req.cookies.token || req.headers["authorization"];
    console.log(token);
    if (!token) {
      console.log("Authentication Error: No token provided in cookies.");
      return res.status(401).json({ error: "No token provided" });
    }
    jwt.verify(token, process.env.JWT_TOKEN, (err, decoded) => {
      if (err) {
        console.log("Token verification failed:", err);
        if (err.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({ isAuthenticated: false, error: "Token expired" });
        } else if (err.name === "JsonWebTokenError") {
          return res
            .status(401)
            .json({ isAuthenticated: false, error: "Token invalid" });
        }
        return res
          .status(401)
          .json({ isAuthenticated: false, error: "Authentication failed" });
      }
      console.log("Token is valid. User ID:", decoded.userId);
      return res.json({ isAuthenticated: true, userId: decoded.userId });
    });
  },
};

exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user || refreshToken !== user.refreshToken) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_TOKEN,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 900000,
    });

    res.status(200).send("Access token refreshed successfully");
  } catch (error) {
    res.status(500).json({ error: "Failed to refresh token" });
  }
};
