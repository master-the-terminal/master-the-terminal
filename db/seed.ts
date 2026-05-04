import { drizzle } from "drizzle-orm/mysql2";
import { createConnection } from "mysql2/promise";
import * as schema from "./schema";
import seedData from "./seed_data.json";
import "dotenv/config";

async function seed() {
  const connection = createConnection(process.env.DATABASE_URL!);
  const db = drizzle(await connection, { mode: "planetscale", schema });

  // Clear existing data
  await db.delete(schema.progress);
  await db.delete(schema.payments);
  await db.delete(schema.lessons);
  await db.delete(schema.courses);
  await db.delete(schema.knowledgebase);

  // Seed Courses
  for (const c of seedData.courses) {
    await db.insert(schema.courses).values(c);
  }

  const coursesRows = await db.select().from(schema.courses).orderBy(schema.courses.sortOrder);
  const courseMap = new Map(coursesRows.map((c) => [c.slug, c.id]));

  // Seed Lessons
  for (const l of seedData.lessons) {
    const courseId = courseMap.get(l.courseSlug);
    if (!courseId) continue;
    await db.insert(schema.lessons).values({
      courseId,
      title: l.title,
      slug: l.slug,
      sortOrder: l.sortOrder,
      isFree: l.isFree,
      content: l.content,
      demoSteps: l.demoSteps,
      quiz: l.quiz,
      exercises: l.exercises,
    });
  }

  // Seed Knowledgebase
  for (const kb of seedData.knowledgebase) {
    await db.insert(schema.knowledgebase).values(kb);
  }

  console.log("Seed completed successfully!");
  await (await connection).end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
