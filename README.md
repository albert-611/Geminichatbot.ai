# Gemini AI – Professional Web Chatbot

A modern, full-stack AI chatbot built with **Next.js (App Router)** and a decoupled **Node.js/Express.js REST backend**, powered by the official **Google Gemini API** (`@google/genai`).

Designed as a SaaS AI interface featuring a dark aesthetic, typography, markdown code highlighting with one-click copy, and persistent conversation management.

---

## Architecture Overview

```text
gemini-ai-chatbot/
│
├── frontend/                  # Next.js App Router (React, Tailwind CSS, Lucide)
│   ├── app/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx            # Multi-conversation drawer, titles, deletion & API status
│   │   │   ├── ChatWindow.jsx         # Chat timeline, model switch & navigation
│   │   │   ├── ChatMessage.jsx        # Markdown rendering, syntax tags, copy & retry actions
│   │   │   ├── ChatInput.jsx          # Auto-resizing textarea, character counter, send button
│   │   │   ├── WelcomeScreen.jsx      # Feature suggestion prompt cards
│   │   │   └── LoadingIndicator.jsx   # Animated thinking state
│   │   ├── globals.css                # Custom scrollbars & design tokens
│   │   ├── layout.js                  # Inter, Manrope, JetBrains Mono font optimization
│   │   └── page.js                    # Chat state, localStorage persistence & backend integration
│   ├── .env.local                     # Frontend environment config
│   ├── tailwind.config.js             # Theme colors & animation extensions
│   └── package.json
│
├── backend/                   # Express.js REST API
│   ├── config/
│   │   └── gemini.js                  # Official Google Gen AI SDK initialization
│   ├── controllers/
│   │   └── chatController.js          # Chat completion & health check logic
│   ├── routes/
│   │   └── chatRoutes.js              # /api/chat and /api/health endpoints
│   ├── middleware/
│   │   └── errorHandler.js            # Secure, user-friendly error normalization
│   ├── server.js                      # Express app, CORS & rate-limiting configuration
│   ├── .env                           # Server secrets (excluded from git)
│   ├── .env.example                   # Server template
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Key Features

1. **Decoupled Architecture**:
   - Clean Express.js backend managing rate limits, payload validation, and Gemini API communications.
   - Client API key isolation: `GEMINI_API_KEY` is kept on the backend and never exposed to the frontend.

2. **UI/UX Design System**:
   - Custom dark theme palette: `#0B0D12` (main), `#10131A` (sidebar), `#141821` (cards), `#8B7CFF` (accent).
   - Google typography: Inter (body), Manrope (headings), and JetBrains Mono (code blocks).
   - Full responsiveness across desktop, tablet, and mobile with animated slide-over navigation.

3. **Rich Conversation Experience**:
   - Markdown support with headers, lists, blockquotes, and code blocks with syntax copy.
   - Multi-turn conversation context preserved across interactions.
   - Automatic conversation title generation from user queries.
   - Conversation management: create new chats, rename titles, delete individual chats, or clear history.
   - Local storage persistence: restores active chats on browser refresh.
   - Quick prompt suggestion cards on the initial welcome screen.
   - Retry failed or previous AI responses.

---

## Getting Started

### Prerequisites
- Node.js v18+ (tested on Node v24)
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)

---

### Step 1: Configure Backend

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file:
   ```bash
   cp .env.example .env
   ```
4. Open `.env` and insert your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```
5. Start the backend server:
   ```bash
   npm start
   # or with auto-reload:
   npm run dev
   ```
   The backend will be available at `http://localhost:5000`.

---

### Step 2: Configure and Start Frontend

1. In a separate terminal, navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify your `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Endpoints

### `GET /api/health`
Checks server status and confirms whether the Gemini API key is configured.
```json
{
  "status": "ok",
  "appName": "Gemini AI Chatbot",
  "apiConfigured": true,
  "model": "gemini-2.5-flash",
  "timestamp": "2026-11-04T15:52:59.780Z"
}
```

### `POST /api/chat`
Generates a response from Google Gemini.
- **Request Body**:
  ```json
  {
    "message": "Explain how React Server Components work",
    "history": [
      { "role": "user", "content": "Hi" },
      { "role": "model", "content": "Hello! How can I assist you today?" }
    ],
    "model": "gemini-2.5-flash"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "model": "gemini-2.5-flash",
    "reply": "..."
  }
  ```

---

## Security Best Practices
- **Environment Isolation**: The Gemini API key is never bundled in frontend JavaScript bundles or sent via client requests.
- **Rate Limiting**: Configured via `express-rate-limit` to prevent abuse.
- **Payload Validation**: Inputs are trimmed and length-checked (up to 8,000 characters) to prevent oversized payloads.
- **Error Normalization**: Internal stack traces and Google API provider details are scrubbed, presenting user-friendly actionable feedback to clients.

