import { Router, type IRouter } from "express";
import { db, categoriesTable, eventsTable } from "@workspace/db";
import {
  CreateCategoryBody,
  ListCategoriesResponse,
} from "@workspace/api-zod";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/categories", async (req, res): Promise<void> => {
  const cats = await db.select().from(categoriesTable);

  const withCounts = await Promise.all(
    cats.map(async (cat) => {
      const [row] = await db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(eventsTable)
        .where(eq(eventsTable.category, cat.name));
      return { ...cat, eventCount: row?.count ?? 0 };
    })
  );

  res.json(ListCategoriesResponse.parse(withCounts));
});

router.post("/categories", async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [cat] = await db
    .insert(categoriesTable)
    .values(parsed.data)
    .returning();

  res.status(201).json({ ...cat, eventCount: 0 });
});

export default router;
