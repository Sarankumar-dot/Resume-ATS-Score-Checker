import env from "../config/env.js";

/**
 * A lightweight wrapper for the Google Gemini REST API.
 * Uses the free-tier `gemini-3.5-flash` model.
 * 
 * @param {string} prompt - The prompt to send to the model.
 * @returns {Promise<string>} - The text response from the model.
 */
export async function generateRewrite(prompt) {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("AI service is currently busy. Please try again in a moment.");
      }
      
      const errorData = await response.json().catch(() => ({}));
      console.error("[Gemini API Error]", response.status, errorData);
      throw new Error("AI service failed to generate a rewrite. Please try again later.");
    }

    const data = await response.json();
    
    // Parse the Gemini REST API response structure — concatenate ALL parts
    const parts = data?.candidates?.[0]?.content?.parts;
    if (!parts || parts.length === 0) {
      throw new Error("Received malformed response from AI service.");
    }

    const text = parts.map(p => p.text || "").join("");
    if (!text) {
      throw new Error("Received empty response from AI service.");
    }

    return text.trim();
  } catch (err) {
    // Re-throw known errors, or wrap unexpected ones
    if (err.message.includes("AI service") || err.message.includes("GEMINI_API_KEY")) {
      throw err;
    }
    console.error("[Gemini Request Failed]", err);
    throw new Error("Failed to connect to the AI service. Please check your network or try again later.");
  }
}
