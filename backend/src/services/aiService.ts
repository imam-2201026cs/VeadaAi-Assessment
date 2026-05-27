import { GoogleGenAI } from '@google/genai';
import { AssignmentInput, GeneratedPaper } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are an expert academic question paper generator. Given assignment details, generate a complete structured question paper.

Return ONLY valid JSON with this exact shape — no markdown, no explanation:
{
  "title": string,
  "subject": string,
  "totalMarks": number,
  "duration": string,
  "instructions": string[],
  "sections": [
    {
      "id": string,
      "title": string,
      "instruction": string,
      "questions": [
        {
          "id": string,
          "text": string,
          "type": string,
          "difficulty": "Easy" | "Moderate" | "Hard",
          "marks": number
        }
      ]
    }
  ]
}

Rules:
- Group questions into 2-3 sections (A, B, C) based on question type or cognitive level
- Each question must have a realistic, well-formed academic question text
- The sum of all question marks must equal the requested totalMarks
- Distribute difficulty: easy=30%, moderate=50%, hard=20% unless specified otherwise
- Duration: estimate based on total marks (1 mark ≈ 1.5 minutes)
- Include 3-5 general instructions
- Return ONLY the raw JSON object`;

export const generateQuestionPaper = async (
  input: AssignmentInput,
  onProgress?: (pct: number, msg: string) => void
): Promise<GeneratedPaper> => {
  onProgress?.(10, 'Building structured prompt...');

  const userPrompt = `Generate a question paper with the following details:
- Title: ${input.title}
- Subject: ${input.subject}
- Question Types: ${input.questionTypes.join(', ')}
- Number of Questions: ${input.numQuestions}
- Total Marks: ${input.totalMarks}
- Difficulty Level: ${input.difficulty}
- Due Date: ${input.dueDate}
- Additional Instructions: ${input.additionalInstructions || 'None'}

Ensure the paper is comprehensive, well-structured, and appropriate for the subject.`;

  onProgress?.(30, 'Sending to AI model...');

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userPrompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.7,
    }
  });

  onProgress?.(70, 'Parsing AI response...');

  const raw = response.text || '';
  const cleaned = raw.replace(/```json|```/g, '').trim();

  let paper: GeneratedPaper;
  try {
    paper = JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse AI response as JSON');
  }

  // Validate structure
  if (!paper.sections || !Array.isArray(paper.sections)) {
    throw new Error('Invalid paper structure: missing sections');
  }

  onProgress?.(90, 'Validating and storing result...');
  return paper;
};
