import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { courses, lessons } from "@db/schema";
import { eq, asc } from "drizzle-orm";

export const courseRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    const allCourses = await db.select().from(courses).orderBy(asc(courses.sortOrder));
    return allCourses;
  }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const course = await db.query.courses.findFirst({
        where: eq(courses.slug, input.slug),
      });
      if (!course) {
        throw new Error("Course not found");
      }
      const courseLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.courseId, course.id))
        .orderBy(asc(lessons.sortOrder));
      return { ...course, lessons: courseLessons };
    }),
});
