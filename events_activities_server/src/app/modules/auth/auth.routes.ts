import { Router } from "express";
import { tokenVerifier } from "../../middlewares/tokenVerifier";
import validateRequest from "../../middlewares/validateRequest";
import * as authControllers from "./auth.controller";
import { LoginSchema, ResetPasswordSchema } from "./auth.validation";

const router = Router();

router.post("/login", validateRequest(LoginSchema), authControllers.login);

router.post(
  "/reset-password",
  tokenVerifier,
  validateRequest(ResetPasswordSchema),
  authControllers.resetPassword,
);

router.post("/refresh", authControllers.getAccessTokenByRefreshToken);

export default router;
