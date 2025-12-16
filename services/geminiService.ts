import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const analyzeStock = async (ticker: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your configuration.");
  }

  const prompt = `
    You are a world-class Technical Stock Analyst. 
    Analyze the stock ticker: ${ticker}.
    
    Step 1: Use Google Search to find the latest price (as of today), chart patterns, and key technical levels (support/resistance) for the last 6-12 months.
    Step 2: Determine the best entry price, stop loss, and 3 exit targets (Conservative, Moderate, Aggressive).
    Step 3: Calculate the Risk/Reward ratio.
    Step 4: Provide a summary of the technical setup (Moving Averages, RSI, MACD, etc.).
    Step 5: Generate a 'chartData' array containing 30 representative daily closing prices for the last 30 days that visually matches the trend you are describing. Ensure the last price matches the current price.

    OUTPUT FORMAT:
    Return ONLY a valid JSON object. Do not wrap it in markdown code blocks. The JSON must match this structure exactly:
    {
      "symbol": "${ticker}",
      "currentPrice": number,
      "currency": "USD",
      "entryPrice": number,
      "entryReason": "string",
      "stopLoss": number,
      "stopLossReason": "string",
      "targets": [
        { "label": "Conservative", "price": number, "description": "string" },
        { "label": "Moderate", "price": number, "description": "string" },
        { "label": "Aggressive", "price": number, "description": "string" }
      ],
      "riskRewardRatio": "string",
      "summary": "string",
      "supportLevels": [number, number],
      "resistanceLevels": [number, number],
      "chartData": [ { "date": "MM-DD", "price": number } ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType and responseSchema are NOT allowed when using googleSearch tool
        temperature: 0.2, 
      },
    });

    let text = response.text;
    if (!text) {
      throw new Error("No response received from Gemini.");
    }

    // Clean up markdown code blocks if present (e.g., ```json ... ```)
    text = text.replace(/```json\n?|\n?```/g, "").trim();

    let data: AnalysisResult;
    try {
      data = JSON.parse(text) as AnalysisResult;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw Text:", text);
      throw new Error("Failed to process analysis results. The model response was not valid JSON.");
    }

    // Extract Grounding Sources (Google Search Results)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      data.sources = groundingChunks
        .map((chunk: any) => {
          if (chunk.web) {
            return { title: chunk.web.title, uri: chunk.web.uri };
          }
          return null;
        })
        .filter((source: any) => source !== null);
    }

    return data;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze stock. Please try again.");
  }
};