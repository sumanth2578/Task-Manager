import { createTRPCRouter } from "./trpc";
import { taskRouter } from "./routers/task";
import { postRouter } from "./routers/post";

export const appRouter = createTRPCRouter({
  task: taskRouter,
  post: postRouter,
});

export const createCaller = appRouter.createCaller;

export type AppRouter = typeof appRouter;