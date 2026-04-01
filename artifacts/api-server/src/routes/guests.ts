import { Router, type IRouter } from "express";
import { db, guestsTable, activityTable, eventsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListGuestsParams,
  ListGuestsResponse,
  AddGuestParams,
  AddGuestBody,
  UpdateGuestParams,
  UpdateGuestBody,
  UpdateGuestResponse,
  RemoveGuestParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/events/:eventId/guests", async (req, res): Promise<void> => {
  const params = ListGuestsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const guests = await db
    .select()
    .from(guestsTable)
    .where(eq(guestsTable.eventId, params.data.eventId));

  res.json(ListGuestsResponse.parse(guests));
});

router.post("/events/:eventId/guests", async (req, res): Promise<void> => {
  const params = AddGuestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = AddGuestBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [guest] = await db
    .insert(guestsTable)
    .values({
      eventId: params.data.eventId,
      name: body.data.name,
      email: body.data.email,
      note: body.data.note ?? null,
      rsvpStatus: "pending",
    })
    .returning();

  // Log activity
  const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, params.data.eventId));
  if (event) {
    await db.insert(activityTable).values({
      type: "guest_added",
      eventId: event.id,
      eventTitle: event.title,
      description: `${body.data.name} was added as a guest to "${event.title}"`,
    });
  }

  res.status(201).json(guest);
});

router.patch("/events/:eventId/guests/:guestId", async (req, res): Promise<void> => {
  const params = UpdateGuestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateGuestBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [guest] = await db
    .update(guestsTable)
    .set(body.data)
    .where(and(eq(guestsTable.id, params.data.guestId), eq(guestsTable.eventId, params.data.eventId)))
    .returning();

  if (!guest) {
    res.status(404).json({ error: "Guest not found" });
    return;
  }

  res.json(UpdateGuestResponse.parse(guest));
});

router.delete("/events/:eventId/guests/:guestId", async (req, res): Promise<void> => {
  const params = RemoveGuestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [guest] = await db
    .delete(guestsTable)
    .where(and(eq(guestsTable.id, params.data.guestId), eq(guestsTable.eventId, params.data.eventId)))
    .returning();

  if (!guest) {
    res.status(404).json({ error: "Guest not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
