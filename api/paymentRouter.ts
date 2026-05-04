import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { payments } from "@db/schema";
import { eq } from "drizzle-orm";

export const paymentRouter = createRouter({
  create: authedQuery
    .input(z.object({ amount: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [{ id }] = await db
        .insert(payments)
        .values({
          userId: ctx.user.id,
          amount: input.amount,
          status: "pending",
        })
        .$returningId();
      return { id };
    }),

  myPayments: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(payments)
      .where(eq(payments.userId, ctx.user.id));
  }),

  complete: authedQuery
    .input(z.object({ paymentId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(payments)
        .set({ status: "completed" })
        .where(eq(payments.id, input.paymentId));
      return { success: true };
    }),
});
