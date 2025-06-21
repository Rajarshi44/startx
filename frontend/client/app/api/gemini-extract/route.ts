import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

async function extractFromResume(fileBuffer: Buffer): Promise<Record<string, unknown>> {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Convert buffer to base64 for Gemini API
  const base64 = fileBuffer.toString("base64");

  // Prompt Gemini to extract structured data
  const prompt = `
You are an expert resume parser. Extract the following fields from the attached resume and return as a JSON object with these keys:
first_name, last_name, email, phone, city, country, date_of_birth, gender, languages, current_status, experience_level, education_level, university, graduation_year, skills, interests, career_goals, job_types, work_modes, salary_expectation, availability, willing_to_relocate, bio, achievements, certifications, portfolio_url, linkedin_url, github_url.
If a field is missing, return null or an empty array as appropriate.
`;

  const result = await model.generateContent({
    contents: [
      { role: "user", parts: [{ text: prompt }] },
      { role: "user", parts: [{ inlineData: { mimeType: "application/pdf", data: base64 } }] }
    ],
    generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
    ]
  });

  const text = result.response.text();
  // Try to parse JSON from Gemini's response
  try {
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    return JSON.parse(jsonString);
  } catch {
    throw new Error("Failed to parse Gemini response as JSON");
  }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const extracted = await extractFromResume(buffer);
    return NextResponse.json(extracted);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return NextResponse.json({ error: "Gemini extraction failed" }, { status: 500 });
  }
}