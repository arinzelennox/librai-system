const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

const SYSTEM_PROMPT = `You are LibrAI Assistant, an expert AI for the LibrAI Smart Library and Digital Archive Management System.
You help users find books, generate citations (APA, MLA, Chicago), explain DDC and LC classification systems,
suggest research topics, summarize documents, and answer library science questions.
The library specializes in African literature, Nigerian history, and information management.
Be helpful, concise, and knowledgeable.`;

// ─── AI CHAT ──────────────────────────────────────────────────────────────────
router.post("/chat", protect, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: "Messages array is required." });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    res.json({
      success: true,
      reply: data.content?.[0]?.text || "No response received.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "AI request failed: " + err.message });
  }
});

// ─── GENERATE CITATION ────────────────────────────────────────────────────────
router.post("/citation", protect, async (req, res) => {
  try {
    const { source, style } = req.body;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: `Generate a ${style} citation for: "${source}". Return only the formatted citation, nothing else.`,
        }],
      }),
    });
    const data = await response.json();
    res.json({ success: true, citation: data.content?.[0]?.text });
  } catch (err) {
    res.status(500).json({ success: false, message: "Citation generation failed." });
  }
});

// ─── SUMMARIZE DOCUMENT ───────────────────────────────────────────────────────
router.post("/summarize", protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.length < 50) {
      return res.status(400).json({ success: false, message: "Text too short to summarize." });
    }
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        messages: [{
          role: "user",
          content: `Summarize this text in 4-5 clear bullet points for a library research context:\n\n${text.slice(0, 3000)}`,
        }],
      }),
    });
    const data = await response.json();
    res.json({ success: true, summary: data.content?.[0]?.text });
  } catch (err) {
    res.status(500).json({ success: false, message: "Summarization failed." });
  }
});

module.exports = router;
