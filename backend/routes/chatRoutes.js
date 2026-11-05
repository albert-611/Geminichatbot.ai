const express = require("express");
const router = express.Router();
const { handleChat, handleChatStream, handleHealth } = require("../controllers/chatController");

router.post("/chat", handleChat);
router.post("/chat/stream", handleChatStream);
router.get("/health", handleHealth);

module.exports = router;
