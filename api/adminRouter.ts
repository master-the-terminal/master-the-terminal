import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, progress, payments, courses, lessons } from "@db/schema";
import { sql } from "drizzle-orm";

export const adminRouter = createRouter({
  stats: adminQuery.query(async () => {
    const db = getDb();
    const [userCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    const [lessonCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(lessons);
    const [courseCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses);
    const [paymentCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(payments);
    const [progressCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(progress);
    return {
      users: userCount?.count ?? 0,
      lessons: lessonCount?.count ?? 0,
      courses: courseCount?.count ?? 0,
      payments: paymentCount?.count ?? 0,
      progressEntries: progressCount?.count ?? 0,
    };
  }),

  listUsers: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(users);
  }),
});
