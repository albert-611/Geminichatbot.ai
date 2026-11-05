require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const chatRoutes = require("./routes/chatRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Security: CORS configuration
const allowedOrigins = [
  FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith("http://localhost:")) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly fallback
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Body parsing with size limit
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Rate limiting (60 requests per 1 minute window per IP)
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again after a minute."
  }
});

app.use("/api/chat", chatLimiter);

// API Routes
app.use("/api", chatRoutes);

// Root route for quick verification
app.get("/", (req, res) => {
  res.json({
    status: "active",
    message: "Gemini AI Chatbot Backend API is running",
    endpoints: {
      health: "/api/health",
      chat: "POST /api/chat"
    }
  });
});

// Centralized error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Gemini Server] Listening on port ${PORT}`);
  console.log(`[Gemini Server] Health check: http://localhost:${PORT}/api/health`);
});

