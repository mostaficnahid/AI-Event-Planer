import { Router, type IRouter } from "express";
import { eq, sql, gte, desc, or, ilike } from "drizzle-orm";
import { db, eventsTable, activityTable } from "@workspace/db";
import {
  ListEventsQueryParams,
  ListEventsResponse,
  CreateEventBody,
  GetEventParams,
  GetEventResponse,
  UpdateEventParams,
  UpdateEventBody,
  UpdateEventResponse,
  DeleteEventParams,
  RsvpToEventParams,
  RsvpToEventResponse,
  GetDashboardSummaryResponse,
  GetUpcomingEventsQueryParams,
  GetUpcomingEventsResponse,
  GetRecentActivityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/events/dashboard", async (req, res): Promise<void> => {
  const events = await db.select().from(eventsTable);

  const now = new Date();
  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => new Date(e.startDate) > now && e.status === "published").length;
  const totalAttendees = events.reduce((sum, e) => sum + e.attendeeCount, 0);
  const publishedEvents = events.filter(e => e.status === "published").length;
  const completedEvents = events.filter(e => e.status === "completed").length;
  const cancelledEvents = events.filter(e => e.status === "cancelled").length;
  const draftEvents = events.filter(e => e.status === "draft").length;

  const categoryMap = new Map<string, number>();
  for (const event of events) {
    categoryMap.set(event.category, (categoryMap.get(event.category) ?? 0) + 1);
  }
  const eventsByCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count }));

  const summary = GetDashboardSummaryResponse.parse({
    totalEvents,
    upcomingEvents,
    totalAttendees,
    publishedEvents,
    completedEvents,
    cancelledEvents,
    draftEvents,
    eventsByCategory,
  });

  res.json(summary);
});

router.get("/events/upcoming", async (req, res): Promise<void> => {
  const params = GetUpcomingEventsQueryParams.safeParse(req.query);
  const limit = params.success && params.data.limit ? params.data.limit : 5;

  const now = new Date();
  const events = await db
    .select()
    .from(eventsTable)
    .where(gte(eventsTable.startDate, now))
    .orderBy(eventsTable.startDate)
    .limit(limit);

  res.json(GetUpcomingEventsResponse.parse(events));
});

router.get("/events/recent-activity", async (req, res): Promise<void> => {
  const activity = await db
    .select()
    .from(activityTable)
    .orderBy(desc(activityTable.timestamp))
    .limit(20);

  res.json(GetRecentActivityResponse.parse(activity));
});

router.get("/events", async (req, res): Promise<void> => {
  const params = ListEventsQueryParams.safeParse(req.query);

  let query = db.select().from(eventsTable).$dynamic();

  if (params.success) {
    const { category, status, search, limit, offset } = params.data;
    const conditions = [];

    if (category) {
      conditions.push(eq(eventsTable.category, category));
    }
    if (status) {
      conditions.push(eq(eventsTable.status, status));
    }
    if (search) {
      conditions.push(
        or(
          ilike(eventsTable.title, `%${search}%`),
          ilike(eventsTable.description, `%${search}%`),
          ilike(eventsTable.location, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      const { and } = await import("drizzle-orm");
      query = query.where(and(...conditions));
    }

    if (limit) {
      query = query.limit(limit);
    }
    if (offset) {
      query = query.offset(offset);
    }
  }

  const events = await query.orderBy(desc(eventsTable.createdAt));
  res.json(ListEventsResponse.parse(events));
});

router.post("/events", async (req, res): Promise<void> => {
  const parsed = CreateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [event] = await db
    .insert(eventsTable)
    .values({
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      tags: parsed.data.tags ?? [],
      attendeeCount: 0,
    })
    .returning();

  await db.insert(activityTable).values({
    type: "created",
    eventId: event.id,
    eventTitle: event.title,
    description: `Event "${event.title}" was created`,
  });

  res.status(201).json(GetEventResponse.parse(event));
});

router.get("/events/:id", async (req, res): Promise<void> => {
  const params = GetEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [event] = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.id, params.data.id));

  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.json(GetEventResponse.parse(event));
});

router.patch("/events/:id", async (req, res): Promise<void> => {
  const params = UpdateEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.startDate) {
    updateData.startDate = new Date(parsed.data.startDate);
  }
  if (parsed.data.endDate) {
    updateData.endDate = new Date(parsed.data.endDate);
  }

  const [event] = await db
    .update(eventsTable)
    .set(updateData)
    .where(eq(eventsTable.id, params.data.id))
    .returning();

  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  await db.insert(activityTable).values({
    type: "updated",
    eventId: event.id,
    eventTitle: event.title,
    description: `Event "${event.title}" was updated`,
  });

  res.json(UpdateEventResponse.parse(event));
});

router.delete("/events/:id", async (req, res): Promise<void> => {
  const params = DeleteEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [event] = await db
    .delete(eventsTable)
    .where(eq(eventsTable.id, params.data.id))
    .returning();

  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  await db.insert(activityTable).values({
    type: "cancelled",
    eventId: params.data.id,
    eventTitle: event.title,
    description: `Event "${event.title}" was deleted`,
  });

  res.sendStatus(204);
});

router.post("/events/:id/rsvp", async (req, res): Promise<void> => {
  const params = RsvpToEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [event] = await db
    .update(eventsTable)
    .set({ attendeeCount: sql`${eventsTable.attendeeCount} + 1` })
    .where(eq(eventsTable.id, params.data.id))
    .returning();

  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  await db.insert(activityTable).values({
    type: "rsvp",
    eventId: event.id,
    eventTitle: event.title,
    description: `Someone RSVP'd to "${event.title}"`,
  });

  res.json(RsvpToEventResponse.parse(event));
});

export default router;
