// File: services/geminiService.js
import { GoogleGenAI } from "@google/genai";
import { resumeAnalysisSchema } from '../utils/analysisUtils.js';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// Helper function with exponential backoff for retrying API calls
export const callGeminiWithRetry = async (instructions, maxRetries = 3) => {
    let lastError = null;
    for (let i = 0; i < maxRetries; i++) {
        try {
            console.log(`Attempt ${i + 1} to call Gemini API...`);
            const response = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: [{ parts: [{ text: instructions }] }],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: resumeAnalysisSchema,
                },
            });
            console.log(`✅ Backend: Received response from Gemini on attempt ${i + 1}.`);
            return response;
        } catch (error) {
            lastError = error;
            console.error(`❌ Backend: API call failed on attempt ${i + 1}:`, error.message);
            // Check for service unavailable or rate limit errors
            if (error.status === 503 || error.status === 429) {
                const delay = Math.pow(2, i) * 1000; // Exponential backoff: 1s, 2s, 4s
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await new Promise(res => setTimeout(res, delay));
            } else {
                // If it's another type of error, no need to retry
                throw error;
            }
        }
    }
    // If all retries fail, throw the last error
    throw lastError;
};