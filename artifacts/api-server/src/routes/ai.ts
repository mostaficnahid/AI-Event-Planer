import { Router, type IRouter } from "express";
import OpenAI from "openai";
import {
  GenerateEventDescriptionBody,
  GenerateEventDescriptionResponse,
  SuggestEventScheduleBody,
  SuggestEventScheduleResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

router.post("/ai/generate-description", async (req, res): Promise<void> => {
  const parsed = GenerateEventDescriptionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { title, category, location, additionalContext } = parsed.data;

  const prompt = `Generate a compelling, professional event description for the following event:

Title: ${title}
Category: ${category}
Location: ${location}
${additionalContext ? `Additional Context: ${additionalContext}` : ""}

Provide a JSON response with:
1. "description": A 2-3 paragraph engaging description (150-250 words) that captures the essence of the event
2. "tags": An array of 3-6 relevant tags for this event

Respond ONLY with valid JSON, no markdown code blocks.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    res.status(500).json({ error: "Failed to generate description" });
    return;
  }

  const parsed2 = JSON.parse(content);
  res.json(
    GenerateEventDescriptionResponse.parse({
      description: parsed2.description ?? "",
      tags: parsed2.tags ?? [],
    })
  );
});

router.post("/ai/suggest-schedule", async (req, res): Promise<void> => {
  const parsed = SuggestEventScheduleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { title, category, durationHours, preferredDayOfWeek } = parsed.data;

  const now = new Date();
  const prompt = `Suggest 3 optimal scheduling options for this event:

Event Title: ${title}
Category: ${category}
Duration: ${durationHours} hours
${preferredDayOfWeek ? `Preferred Day: ${preferredDayOfWeek}` : ""}
Current Date: ${now.toISOString()}

Consider:
- Best times for ${category} events
- Day of week preferences for engagement
- Avoiding common conflicts

Provide a JSON response with a "suggestions" array, each containing:
- "startDate": ISO 8601 date-time string (must be in the future, within next 60 days)
- "endDate": ISO 8601 date-time string (startDate + ${durationHours} hours)
- "reasoning": Brief explanation of why this slot is optimal (1-2 sentences)

Respond ONLY with valid JSON, no markdown code blocks.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    res.status(500).json({ error: "Failed to suggest schedule" });
    return;
  }

  const result = JSON.parse(content);
  res.json(SuggestEventScheduleResponse.parse({ suggestions: result.suggestions ?? [] }));
});

export default router;
