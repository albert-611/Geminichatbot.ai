const { getGeminiClient } = require("../config/gemini");

/**
 * Normalizes and trims conversation history to prevent payload bloat.
 * Limits to the most recent turns (default last 12 messages) to keep context fast and focused.
 */
function formatHistory(history, maxTurns = 12) {
  if (!Array.isArray(history)) return [];

  // Slice the most recent messages to protect latency & token budget
  const recentHistory = history.slice(-maxTurns);
  const formatted = [];

  for (const item of recentHistory) {
    if (!item || !item.content || item.isError) continue;

    const role = (item.role === "assistant" || item.role === "bot" || item.role === "model")
      ? "model"
      : "user";

    // Cap individual turn content length in history if exceptionally huge
    const trimmedText = String(item.content).slice(0, 4000);

    formatted.push({
      role: role,
      parts: [{ text: trimmedText }]
    });
  }
  return formatted;
}

// Resilient priority list of active flash models
const MODEL_CANDIDATES = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-flash-latest"
];

/**
 * POST /api/chat/stream - Server-Sent Events (SSE) Streaming endpoint
 */
async function handleChatStream(req, res, next) {
  // Set SSE streaming headers
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable proxy buffering (Nginx, etc.)
  res.flushHeaders?.();

  let clientDisconnected = false;
  req.on("close", () => {
    clientDisconnected = true;
  });

  const sendEvent = (event, data) => {
    if (clientDisconnected || res.writableEnded) return;
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const startTime = Date.now();
  let timeToFirstChunk = null;
  let totalChunks = 0;
  let accumulatedText = "";
  let finalUsage = null;

  try {
    const { message, history = [], model } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      sendEvent("error", { message: "Message cannot be empty." });
      return res.end();
    }

    if (message.length > 8000) {
      sendEvent("error", { message: "Message exceeds maximum allowed length (8000 characters)." });
      return res.end();
    }

    const ai = getGeminiClient();
    if (!ai) {
      sendEvent("error", {
        message: "Gemini API key is not configured on the server. Please check your backend .env file."
      });
      return res.end();
    }

    const contents = [
      ...formatHistory(history, 12),
      {
        role: "user",
        parts: [{ text: message.trim() }]
      }
    ];

    const requestedModel = (model && typeof model === "string") ? model.trim() : "";
    const modelsToTry = [];

    // Filter out deprecated 2.5 names
    if (requestedModel && !requestedModel.includes("2.5-flash") && !requestedModel.includes("2.5-pro")) {
      modelsToTry.push(requestedModel);
    }
    for (const m of MODEL_CANDIDATES) {
      if (!modelsToTry.includes(m)) {
        modelsToTry.push(m);
      }
    }

    let stream = null;
    let chosenModel = null;
    let lastError = null;

    // Model fallback attempt loop
    for (const targetModel of modelsToTry) {
      if (clientDisconnected) break;
      try {
        stream = await ai.models.generateContentStream({
          model: targetModel,
          contents: contents,
          config: {
            systemInstruction: "You are Gemini AI, a helpful, precise, and articulate assistant. Provide thoughtful, well-structured responses. Format code with appropriate language syntax tags.",
            maxOutputTokens: 2500, // Reasonable limit to avoid runaway generations while allowing deep explanations
            temperature: 0.7
          }
        });
        chosenModel = targetModel;
        break;
      } catch (err) {
        lastError = err;
        console.warn(`[Gemini Stream] Model '${targetModel}' connection failed:`, err.message || err);
        const errMsg = err.message || "";
        if (errMsg.includes("API_KEY_INVALID") || errMsg.includes("invalid API key") || errMsg.includes("403")) {
          sendEvent("error", { message: "Invalid or unauthorized Gemini API key. Please check your backend .env." });
          return res.end();
        }
      }
    }

    if (!stream || clientDisconnected) {
      if (clientDisconnected) return res.end();
      const errMsg = lastError?.message || "";
      if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("429") || errMsg.includes("quota")) {
        sendEvent("error", { message: "Gemini API rate limit or quota exceeded. Please try again shortly." });
      } else {
        sendEvent("error", { message: "Google Gemini API is currently unavailable or experiencing high demand." });
      }
      return res.end();
    }

    // Notify client of stream start and chosen model
    sendEvent("start", { model: chosenModel });

    // Stream chunks iteratively as they arrive from Gemini
    for await (const chunk of stream) {
      if (clientDisconnected) {
        console.log(`[Gemini Stream] Client disconnected mid-stream for model ${chosenModel}`);
        break;
      }

      if (timeToFirstChunk === null) {
        timeToFirstChunk = Date.now() - startTime;
      }

      const chunkText = chunk.text || "";
      if (chunkText) {
        totalChunks++;
        accumulatedText += chunkText;
        sendEvent("chunk", { text: chunkText });
      }

      if (chunk.usageMetadata) {
        finalUsage = chunk.usageMetadata;
      }
    }

    const totalDuration = Date.now() - startTime;

    // Log backend performance metrics (never exposed to frontend users)
    console.log(`\n[Gemini Performance]`);
    console.log(`Model: ${chosenModel}`);
    console.log(`Time to First Chunk: ${timeToFirstChunk ?? totalDuration} ms`);
    console.log(`Total Generation Time: ${totalDuration} ms`);
    console.log(`Total Chunks: ${totalChunks}`);
    console.log(`Input Tokens: ${finalUsage?.promptTokenCount ?? "N/A"}`);
    console.log(`Output Tokens: ${finalUsage?.candidatesTokenCount ?? "N/A"}`);
    console.log(`Total Tokens: ${finalUsage?.totalTokenCount ?? "N/A"}\n`);

    if (!clientDisconnected) {
      sendEvent("done", {
        model: chosenModel,
        totalChunks: totalChunks,
        totalTimeMs: totalDuration,
        timeToFirstChunkMs: timeToFirstChunk
      });
      res.end();
    }
  } catch (streamError) {
    console.error("[Gemini Stream Error]:", streamError.message || streamError);
    if (!clientDisconnected && !res.writableEnded) {
      sendEvent("error", {
        message: "An error occurred during response streaming. Please try again."
      });
      res.end();
    }
  }
}

/**
 * Standard non-streaming POST /api/chat fallback
 */
async function handleChat(req, res, next) {
  const startTime = Date.now();
  try {
    const { message, history = [], model } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ success: false, error: "Message cannot be empty." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: "Gemini API key is not configured on the server. Please check your backend .env file."
      });
    }

    const contents = [
      ...formatHistory(history, 12),
      {
        role: "user",
        parts: [{ text: message.trim() }]
      }
    ];

    const requestedModel = (model && typeof model === "string") ? model.trim() : "";
    const modelsToTry = [];

    if (requestedModel && !requestedModel.includes("2.5-flash") && !requestedModel.includes("2.5-pro")) {
      modelsToTry.push(requestedModel);
    }
    for (const m of MODEL_CANDIDATES) {
      if (!modelsToTry.includes(m)) {
        modelsToTry.push(m);
      }
    }

    let response = null;
    let chosenModel = null;
    let lastError = null;

    for (const targetModel of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model: targetModel,
          contents: contents,
          config: {
            systemInstruction: "You are Gemini AI, a helpful, precise, and articulate assistant. Provide thoughtful, well-structured responses. Format code with appropriate language syntax tags.",
            maxOutputTokens: 2500,
            temperature: 0.7
          }
        });
        if (response?.text) {
          chosenModel = targetModel;
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`[Gemini API] Model '${targetModel}' failed:`, err.message || err);
      }
    }

    if (!response || !response.text) {
      return res.status(502).json({
        success: false,
        error: "Google Gemini API is currently unavailable or experiencing high demand. Please try again."
      });
    }

    const totalDuration = Date.now() - startTime;
    console.log(`\n[Gemini Performance] Non-streaming Response`);
    console.log(`Model: ${chosenModel}`);
    console.log(`Total Generation Time: ${totalDuration} ms\n`);

    return res.status(200).json({
      success: true,
      model: chosenModel,
      reply: response.text
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/health
 */
function handleHealth(req, res) {
  const isConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key");

  return res.status(200).json({
    status: "ok",
    appName: "Gemini AI Chatbot",
    apiConfigured: isConfigured,
    model: "gemini-3.5-flash-lite",
    supportsStreaming: true,
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  handleChat,
  handleChatStream,
  handleHealth
};
