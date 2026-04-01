import { db, eventsTable, categoriesTable, activityTable } from "@workspace/db";

async function seed() {
  console.log("Seeding database...");

  // Seed categories
  const categoryData = [
    { name: "Technology", color: "#6366f1", icon: "Cpu" },
    { name: "Business", color: "#f59e0b", icon: "Briefcase" },
    { name: "Arts", color: "#ec4899", icon: "Palette" },
    { name: "Sports", color: "#10b981", icon: "Trophy" },
    { name: "Education", color: "#3b82f6", icon: "GraduationCap" },
    { name: "Networking", color: "#8b5cf6", icon: "Users" },
  ];

  for (const cat of categoryData) {
    await db
      .insert(categoriesTable)
      .values(cat)
      .onConflictDoNothing();
  }
  console.log("Categories seeded");

  // Clear events and activity for clean seed
  await db.delete(activityTable);
  await db.delete(eventsTable);

  const now = new Date();
  const addDays = (d: Date, days: number) => {
    const r = new Date(d);
    r.setDate(r.getDate() + days);
    return r;
  };
  const setHour = (d: Date, hour: number) => {
    const r = new Date(d);
    r.setHours(hour, 0, 0, 0);
    return r;
  };

  const eventsData = [
    {
      title: "AI & Machine Learning Summit 2026",
      description: "Join industry leaders for a deep dive into the latest advances in artificial intelligence and machine learning. Featuring keynotes from top researchers, hands-on workshops, and networking sessions.",
      category: "Technology",
      location: "San Francisco Convention Center, CA",
      startDate: setHour(addDays(now, 7), 9),
      endDate: setHour(addDays(now, 7), 17),
      status: "published" as const,
      attendeeCount: 342,
      maxAttendees: 500,
      tags: ["AI", "ML", "Tech", "Innovation"],
    },
    {
      title: "Startup Pitch Night",
      description: "Watch 10 promising startups pitch their ideas to a panel of seasoned investors. Network with founders, VCs, and fellow entrepreneurs over cocktails.",
      category: "Business",
      location: "WeWork SoMa, San Francisco",
      startDate: setHour(addDays(now, 14), 18),
      endDate: setHour(addDays(now, 14), 21),
      status: "published" as const,
      attendeeCount: 89,
      maxAttendees: 150,
      tags: ["Startups", "Investors", "Networking", "Pitch"],
    },
    {
      title: "Modern Art Exhibition: Futures",
      description: "An immersive exhibition exploring the intersection of technology and contemporary art. Featuring works by 20 emerging and established artists from around the world.",
      category: "Arts",
      location: "SFMOMA, San Francisco",
      startDate: setHour(addDays(now, 21), 10),
      endDate: setHour(addDays(now, 21), 20),
      status: "published" as const,
      attendeeCount: 215,
      tags: ["Art", "Exhibition", "Contemporary", "Culture"],
    },
    {
      title: "Annual 10K Run for Charity",
      description: "Join hundreds of runners for our annual 10K charity run through Golden Gate Park. All proceeds go to local food banks and shelters.",
      category: "Sports",
      location: "Golden Gate Park, San Francisco",
      startDate: setHour(addDays(now, 3), 7),
      endDate: setHour(addDays(now, 3), 12),
      status: "published" as const,
      attendeeCount: 456,
      maxAttendees: 600,
      tags: ["Running", "Charity", "Fitness", "Community"],
    },
    {
      title: "Product Management Masterclass",
      description: "A full-day intensive workshop on modern product management techniques. Learn from PMs at leading tech companies about roadmapping, prioritization, and stakeholder management.",
      category: "Education",
      location: "Online (Zoom)",
      startDate: setHour(addDays(now, -5), 9),
      endDate: setHour(addDays(now, -5), 17),
      status: "completed" as const,
      attendeeCount: 128,
      maxAttendees: 200,
      tags: ["Product", "Management", "Workshop", "Career"],
    },
    {
      title: "Design Systems Conference",
      description: "Explore the future of design systems with talks from Figma, Google, and Airbnb design leads. Sessions cover scalability, component libraries, and cross-functional collaboration.",
      category: "Technology",
      location: "Moscone Center West, San Francisco",
      startDate: setHour(addDays(now, 45), 9),
      endDate: setHour(addDays(now, 46), 17),
      status: "draft" as const,
      attendeeCount: 0,
      maxAttendees: 800,
      tags: ["Design", "UI", "Systems", "Figma"],
    },
    {
      title: "Tech Leaders Networking Brunch",
      description: "An intimate networking brunch for senior technology leaders, CTOs, and VPs of Engineering. Limited seats for meaningful conversations over a gourmet breakfast.",
      category: "Networking",
      location: "Bix Restaurant, San Francisco",
      startDate: setHour(addDays(now, 10), 10),
      endDate: setHour(addDays(now, 10), 13),
      status: "published" as const,
      attendeeCount: 22,
      maxAttendees: 30,
      tags: ["Networking", "Leadership", "CTO", "Tech"],
    },
  ];

  const insertedEvents = await db.insert(eventsTable).values(eventsData).returning();
  console.log(`Inserted ${insertedEvents.length} events`);

  // Seed activity
  const activities = [
    { type: "created" as const, eventId: insertedEvents[0].id, eventTitle: insertedEvents[0].title, description: `Event "${insertedEvents[0].title}" was created` },
    { type: "rsvp" as const, eventId: insertedEvents[0].id, eventTitle: insertedEvents[0].title, description: `Someone RSVP'd to "${insertedEvents[0].title}"` },
    { type: "created" as const, eventId: insertedEvents[1].id, eventTitle: insertedEvents[1].title, description: `Event "${insertedEvents[1].title}" was created` },
    { type: "updated" as const, eventId: insertedEvents[2].id, eventTitle: insertedEvents[2].title, description: `Event "${insertedEvents[2].title}" was updated` },
    { type: "completed" as const, eventId: insertedEvents[4].id, eventTitle: insertedEvents[4].title, description: `Event "${insertedEvents[4].title}" was completed` },
    { type: "rsvp" as const, eventId: insertedEvents[3].id, eventTitle: insertedEvents[3].title, description: `Someone RSVP'd to "${insertedEvents[3].title}"` },
    { type: "created" as const, eventId: insertedEvents[6].id, eventTitle: insertedEvents[6].title, description: `Event "${insertedEvents[6].title}" was created` },
  ];

  for (let i = 0; i < activities.length; i++) {
    const act = activities[i];
    const ts = new Date();
    ts.setHours(ts.getHours() - i * 2);
    await db.insert(activityTable).values({ ...act, timestamp: ts });
  }

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
