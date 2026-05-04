import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { knowledgebase } from "@db/schema";
import { eq, asc, like, or } from "drizzle-orm";

export const knowledgebaseRouter = createRouter({
  list: publicQuery
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.category) {
        return db
          .select()
          .from(knowledgebase)
          .where(eq(knowledgebase.category, input.category))
          .orderBy(asc(knowledgebase.sortOrder));
      }
      return db.select().from(knowledgebase).orderBy(asc(knowledgebase.sortOrder));
    }),

  search: publicQuery
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(knowledgebase)
        .where(
          or(
            like(knowledgebase.title, `%${input.query}%`),
            like(knowledgebase.content, `%${input.query}%`)
          )
        )
        .orderBy(asc(knowledgebase.sortOrder));
    }),
});
