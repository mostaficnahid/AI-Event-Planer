import { Router, type IRouter } from "express";
import OpenAI from "openai";
import {
  GenerateEventDescriptionBody,
  GenerateEventDescriptionResponse,
  SuggestEventScheduleBody,
  SuggestEventScheduleResponse,
  EstimateBudgetBody,
  EstimateBudgetResponse,
  SuggestThemesBody,
  SuggestThemesResponse,
  AiChatBody,
  AiChatResponse,
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
  const prompt = `Generate a compelling event description for:
Title: ${title}
Category: ${category}
Location: ${location}
${additionalContext ? `Context: ${additionalContext}` : ""}

Return JSON only with:
- "description": 2-3 paragraph engaging description (150-250 words)
- "tags": array of 3-6 relevant tags`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content ?? "{}";
  const result = JSON.parse(content);
  res.json(GenerateEventDescriptionResponse.parse({
    description: result.description ?? "",
    tags: result.tags ?? [],
  }));
});

router.post("/ai/suggest-schedule", async (req, res): Promise<void> => {
  const parsed = SuggestEventScheduleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { title, category, durationHours, preferredDayOfWeek } = parsed.data;
  const now = new Date();

  const prompt = `Suggest 3 optimal scheduling options for:
Event: ${title}
Category: ${category}
Duration: ${durationHours} hours
${preferredDayOfWeek ? `Preferred day: ${preferredDayOfWeek}` : ""}
Current date: ${now.toISOString()}

Return JSON with "suggestions" array. Each item: startDate (ISO), endDate (ISO, startDate + ${durationHours}h), reasoning (1-2 sentences). Dates must be in the future within 60 days.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content ?? "{}";
  const result = JSON.parse(content);
  res.json(SuggestEventScheduleResponse.parse({ suggestions: result.suggestions ?? [] }));
});

router.post("/ai/estimate-budget", async (req, res): Promise<void> => {
  const parsed = EstimateBudgetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { title, category, location, attendeeCount, durationHours } = parsed.data;

  const prompt = `Estimate a realistic budget breakdown in USD for this event:
Title: ${title}
Category: ${category}
Location: ${location}
Attendees: ${attendeeCount}
Duration: ${durationHours} hours
Currency: USD

Return JSON with:
- "totalEstimate": total amount in USD (number)
- "breakdown": array of {category, amount, percentage, notes} items (all amounts in USD)
- "currency": "USD"
- "confidence": "low"|"medium"|"high"

Include typical line items like venue, catering, A/V, marketing, staff, etc. as appropriate.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content ?? "{}";
  const result = JSON.parse(content);
  res.json(EstimateBudgetResponse.parse({
    totalEstimate: result.totalEstimate ?? 0,
    breakdown: result.breakdown ?? [],
    currency: result.currency ?? "USD",
    confidence: result.confidence ?? "medium",
  }));
});

router.post("/ai/suggest-themes", async (req, res): Promise<void> => {
  const parsed = SuggestThemesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { title, category, description } = parsed.data;

  const prompt = `Suggest 3 creative themes and improvements for this event:
Title: ${title}
Category: ${category}
Description: ${description}

Return JSON with "themes" array. Each theme: 
- name (creative theme name)
- description (2-3 sentences about the theme)
- improvements (array of 3-4 specific improvements to make the event better)
- engagementTips (array of 3-4 tips to increase attendee engagement)`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content ?? "{}";
  const result = JSON.parse(content);
  res.json(SuggestThemesResponse.parse({ themes: result.themes ?? [] }));
});

router.post("/ai/chat", async (req, res): Promise<void> => {
  const parsed = AiChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message, eventContext, history } = parsed.data;

  const systemPrompt = `You are an expert AI event planning assistant. You help organizers plan successful events with practical, actionable advice on scheduling, venues, budgeting, marketing, guest management, and logistics.${eventContext ? `\n\nEvent context: ${eventContext}` : ""}

Always end your response with a "suggestions" field — provide 2-3 quick follow-up questions the user might want to ask.

Respond in JSON with:
- "reply": your response (markdown supported, 2-4 paragraphs)
- "suggestions": array of 2-3 follow-up question strings`;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...(history ?? []).map(h => ({ role: h.role as "user" | "assistant", content: h.content })),
    { role: "user", content: message },
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 1024,
    messages,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content ?? "{}";
  const result = JSON.parse(content);
  res.json(AiChatResponse.parse({
    reply: result.reply ?? "I'm here to help with your event planning!",
    suggestions: result.suggestions ?? [],
  }));
});

export default router;
