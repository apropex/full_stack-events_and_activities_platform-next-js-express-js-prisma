import { Router } from "express";
import { tokenVerifier } from "../../middlewares/tokenVerifier";
import { userAccessVerifier } from "../../middlewares/userAccessVerifier";
import * as paymentControllers from "./payment.controller";

const router = Router();

router.post("/success", paymentControllers.successPayment);

router.post("/fail", paymentControllers.failPayment);

router.post("/cancel", paymentControllers.cancelPayment);

router.post(
  "/repayment/:bookingId",
  tokenVerifier,
  userAccessVerifier,
  paymentControllers.repayment,
);

router.get(
  "/invoice/:paymentId",
  tokenVerifier,
  userAccessVerifier,
  paymentControllers.getInvoiceUrl,
);

router.post("/validate-payment", paymentControllers.validatePayment);

export default router;
