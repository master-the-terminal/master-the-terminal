import { authRouter } from "./auth-router";
import { courseRouter } from "./courseRouter";
import { lessonRouter } from "./lessonRouter";
import { progressRouter } from "./progressRouter";
import { knowledgebaseRouter } from "./knowledgebaseRouter";
import { adminRouter } from "./adminRouter";
import { paymentRouter } from "./paymentRouter";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  course: courseRouter,
  lesson: lessonRouter,
  progress: progressRouter,
  knowledgebase: knowledgebaseRouter,
  admin: adminRouter,
  payment: paymentRouter,
});

export type AppRouter = typeof appRouter;
