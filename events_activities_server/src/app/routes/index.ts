import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/user/user.routes";

const router = Router();

[
  { path: "/user", route: userRoutes },
  { path: "/auth", route: authRoutes },
].forEach(({ path, route }) => router.use(path, route));

export default router;
