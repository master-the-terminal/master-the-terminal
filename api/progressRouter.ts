import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { progress, lessons, courses } from "@db/schema";
import { eq, and, sql } from "drizzle-orm";

export const progressRouter = createRouter({
  myProgress: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const myProgress = await db
      .select({
        id: progress.id,
        lessonId: progress.lessonId,
        courseId: progress.courseId,
        isCompleted: progress.isCompleted,
        completedAt: progress.completedAt,
        lessonTitle: lessons.title,
        lessonSlug: lessons.slug,
        courseTitle: courses.title,
        courseSlug: courses.slug,
        courseColor: courses.color,
      })
      .from(progress)
      .leftJoin(lessons, eq(progress.lessonId, lessons.id))
      .leftJoin(courses, eq(progress.courseId, courses.id))
      .where(eq(progress.userId, ctx.user.id))
      .orderBy(sql`${progress.completedAt} desc`);
    return myProgress;
  }),

  myStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const completed = await db
      .select({ count: sql<number>`count(*)` })
      .from(progress)
      .where(
        and(eq(progress.userId, ctx.user.id), eq(progress.isCompleted, true))
      );
    const totalLessons = await db
      .select({ count: sql<number>`count(*)` })
      .from(lessons);
    const totalCourses = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses);
    const courseProgress = await db
      .select({
        courseId: progress.courseId,
        completed: sql<number>`count(*)`,
      })
      .from(progress)
      .where(
        and(eq(progress.userId, ctx.user.id), eq(progress.isCompleted, true))
      )
      .groupBy(progress.courseId);

    return {
      completedLessons: completed[0]?.count ?? 0,
      totalLessons: totalLessons[0]?.count ?? 0,
      totalCourses: totalCourses[0]?.count ?? 0,
      courseProgress,
    };
  }),
});
