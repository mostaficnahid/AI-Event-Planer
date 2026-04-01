import bcrypt from "bcryptjs";
import { db, usersTable } from "./index";
import { eq } from "drizzle-orm";

const users = [
  { name: "Admin User", email: "admin@demo.com", password: "demo1234", role: "admin" },
  { name: "Alice Organizer", email: "alice@demo.com", password: "demo1234", role: "organizer" },
  { name: "Bob Attendee", email: "bob@demo.com", password: "demo1234", role: "attendee" },
];

async function seedUsers() {
  for (const u of users) {
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, u.email));
    if (existing) {
      console.log(`User ${u.email} already exists, skipping`);
      continue;
    }
    const passwordHash = await bcrypt.hash(u.password, 12);
    const [created] = await db.insert(usersTable).values({
      name: u.name,
      email: u.email,
      passwordHash,
      role: u.role,
    }).returning();
    console.log(`Created user: ${created.email} (${created.role})`);
  }
}

seedUsers()
  .then(() => { console.log("User seed complete"); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
