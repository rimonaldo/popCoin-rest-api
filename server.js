const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const http = require("http").createServer(app);

// Express App Config
app.use(cookieParser());
app.use(express.json());
if (process.env.NODE_ENV === "production") {
  // Express serve static files on production environment
  app.use(express.static(path.resolve(__dirname, "public")));
} else {
  // Configuring CORS
  const corsOptions = {
    // Make sure origin contains the url your frontend is running on
    origin: [
      "http://127.0.0.1:8080",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
      "http://127.0.0.1:3000",
      "http://localhost:3030",
      "http://localhost:3000",
    ],
    credentials: true,
  };
  app.use(cors(corsOptions));
}

const authRoutes = require("./api/auth/auth.routes");
const userRoutes = require("./api/user/user.routes");
const popCoinRoutes = require("./api/blockchain/blockchain.routes");
const minerRoutes = require("./api/miner/miner.routes");
const { setupSocketAPI } = require("./services/socket.service");

// routes
const setupAsyncLocalStorage = require("./middlewares/setupAls.middleware");
app.all('*', setupAsyncLocalStorage)
app.set('trust proxy', 1)
app.use("/api/popCoin", popCoinRoutes);
app.use("/api/miner", minerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
setupSocketAPI(http);

// Make every server-side-route to match the index.html
// so when requesting http://localhost:3030/index.html/car/123 it will still respond with
// our SPA (single page app) (the index.html file) and allow vue/react-router to take it from there
app.get("/**", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const logger = require("./services/logger.service");
const port = process.env.PORT || 5137;
http.listen(port, () => {
  logger.info("Server is running on port: " + port);
});
