import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing");
}

const ai = new GoogleGenAI({
  apiKey,
});

type ConfirmationData = {
  name: string;
  date: string;
  startTime: string;
  durationMinutes: number;
};

export async function generateBookingConfirmation({
  name,
  date,
  startTime,
  durationMinutes,
}: ConfirmationData): Promise<string> {
  const fallback =
    `You're all set, ${name}! Your lesson is booked for ${date} at ${startTime}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `
Generate one short and friendly booking confirmation message.

Context:
- This is a private tutoring lesson.
- Student name: ${name}
- Date: ${date}
- Start time: ${startTime}
- Duration: ${durationMinutes} minutes

Rules:
- Maximum 2 short sentences.
- Friendly but professional.
- Do not mention AI.
- Do not add information that was not provided.
      `,
    });

    return response.text?.trim() || fallback;
  } catch (error) {
    console.error("Gemini error:", error);
    return fallback;
  }
}