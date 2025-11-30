import { Router } from "express";
import userRoutes from "../modules/user/user.routes";

const router = Router();

[
    { path: "/user", route: userRoutes },
].forEach(({ path, route }) => router.use(path, route));

export default router;
