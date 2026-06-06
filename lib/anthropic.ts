import Anthropic from "@anthropic-ai/sdk";
import { ConversionOutput } from "@/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_PROMPT = `You are a senior product manager and technical architect. Your task is to analyze a Product Requirements Document (PRD) and extract structured output.

You MUST respond with ONLY valid JSON — no markdown fences, no explanation, no preamble, no text outside the JSON object.

The JSON must follow this EXACT structure:
{
  "epics": [
    { "id": "E1", "title": "string", "description": "string" }
  ],
  "userStories": [
    { "id": "US1", "epicId": "E1", "title": "As a [user], I want [goal] so that [reason]", "acceptance": "string describing acceptance criteria" }
  ],
  "devTasks": [
    { "id": "DT1", "storyId": "US1", "title": "string", "estimate": "S|M|L|XL", "notes": "string" }
  ],
  "qaTasks": [
    { "id": "QA1", "storyId": "US1", "title": "string", "type": "functional|regression|performance|accessibility" }
  ]
}

Rules:
- Estimate sizes: S = <2h, M = 2-4h, L = 4-8h, XL = >8h
- Every user story must have at least one dev task and one QA task
- Group logically related stories under the same epic
- Use sequential IDs (E1, E2... / US1, US2... / DT1, DT2... / QA1, QA2...)
- Be thorough — extract ALL implied requirements, not just explicit ones
- Acceptance criteria should be concrete and testable
- Do NOT wrap the JSON in markdown code fences or any other text`;

export async function convertPrdToTasks(prd: string): Promise<ConversionOutput> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Here is the PRD to analyze:\n\n${prd}`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  let rawText = textBlock.text.trim();

  // Strip markdown fences if Claude adds them despite instructions
  rawText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  let parsed: ConversionOutput;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error(`Failed to parse Claude response as JSON: ${rawText.slice(0, 200)}`);
  }

  // Basic validation
  if (
    !Array.isArray(parsed.epics) ||
    !Array.isArray(parsed.userStories) ||
    !Array.isArray(parsed.devTasks) ||
    !Array.isArray(parsed.qaTasks)
  ) {
    throw new Error("Claude response missing required fields");
  }

  return parsed;
}
