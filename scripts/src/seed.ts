import { db, categoriesTable } from "@workspace/db";

async function seed() {
  console.log("Seeding database...");

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
  console.log(`Categories seeded (${categoryData.length})`);

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
