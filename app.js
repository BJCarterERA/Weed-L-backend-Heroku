const express = require("express");
const { json } = express;
const sequelize = require("./config/database.js");
const fetchData = require("./fetchData"); // Ensure you have the path correct
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes.js");
const protectedRoutes = require("./routes/protectedRoutes.js");
const sessionRoutes = require("./routes/sessionRoutes.js");
const strainRoutes = require("./routes/strainRoutes.js");
const cookieParser = require("cookie-parser");

const app = express();

app.use(
  cors({
    origin: "https://weed-l.onrender.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(cookieParser());
app.use(json());
app.use("/auth", authRoutes);
app.use("/users", protectedRoutes);
app.use("/session", sessionRoutes);
app.use("/api", strainRoutes);

app.use((req, res, next) => {
  console.log("Received headers:", req.headers);
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the Weed-L API" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

async function dbConnect() {
  try {
    await sequelize.sync();
    console.log("Database synchronized");
    // await fetchData();
  } catch (error) {
    console.error("Error starting the application:", error);
  }
}

dbConnect();
