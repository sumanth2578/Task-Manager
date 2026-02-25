import { createTRPCRouter } from "~/server/api/trpc";
import { taskRouter } from "./routers/task";
import { postRouter } from "./routers/post";

export const appRouter = createTRPCRouter({
  task: taskRouter,
  post: postRouter,
});

// ✅ THIS FIXES YOUR ERROR
export const createCaller = appRouter.createCaller;

export type AppRouter = typeof appRouter;