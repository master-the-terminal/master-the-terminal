import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { lessons, progress } from "@db/schema";
import { eq, and, asc } from "drizzle-orm";

export const lessonRouter = createRouter({
  getBySlug: publicQuery
    .input(z.object({ courseId: z.number(), slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const lesson = await db.query.lessons.findFirst({
        where: and(eq(lessons.courseId, input.courseId), eq(lessons.slug, input.slug)),
      });
      return lesson ?? null;
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const lesson = await db.query.lessons.findFirst({
        where: eq(lessons.id, input.id),
      });
      return lesson ?? null;
    }),

  listByCourse: publicQuery
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(lessons)
        .where(eq(lessons.courseId, input.courseId))
        .orderBy(asc(lessons.sortOrder));
    }),

  markComplete: authedQuery
    .input(z.object({ lessonId: z.number(), courseId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db.query.progress.findFirst({
        where: and(
          eq(progress.userId, ctx.user.id),
          eq(progress.lessonId, input.lessonId)
        ),
      });
      if (existing) {
        await db
          .update(progress)
          .set({ isCompleted: true, completedAt: new Date() })
          .where(eq(progress.id, existing.id));
      } else {
        await db.insert(progress).values({
          userId: ctx.user.id,
          lessonId: input.lessonId,
          courseId: input.courseId,
          isCompleted: true,
          completedAt: new Date(),
        });
      }
      return { success: true };
    }),
});
