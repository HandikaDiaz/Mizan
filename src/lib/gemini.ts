import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

console.log(
  "API KEY:",
  process.env.GEMINI_API_KEY?.substring(0, 10),
);

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined");
}

export const ai = new GoogleGenAI({
  apiKey,
});