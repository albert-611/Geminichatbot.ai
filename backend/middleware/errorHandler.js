function errorHandler(err, req, res, next) {
  console.error("Unhandled Error:", err.message || err);

  const statusCode = err.status || err.statusCode || 500;
  
  // Format friendly user message without exposing internal stacks or keys
  let friendlyMessage = "An unexpected server error occurred. Please try again later.";

  if (err.status === 400 || err.statusCode === 400) {
    friendlyMessage = err.message || "Invalid request payload.";
  } else if (err.status === 429 || err.statusCode === 429) {
    friendlyMessage = "Rate limit reached. Please wait a moment before sending another message.";
  }

  res.status(statusCode).json({
    success: false,
    error: friendlyMessage
  });
}

module.exports = errorHandler;

