import { Router } from "express";

const router = Router();

[
  //   { path: "/user", route: userRoutes },
].forEach(({ path, route }) => router.use(path, route));

export default router;
