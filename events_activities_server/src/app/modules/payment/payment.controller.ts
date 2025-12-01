import env from "../../../lib/config/env";
import catchAsync from "../../../shared/catchAsync";
import _response from "../../../shared/sendResponse";
import { validationPayment } from "../sslCommerz/sslCommerz.service";
import * as paymentServices from "./payment.service";

const ssl = env.ssl;

export const successPayment = catchAsync(async (req, res) => {
  const { trxId, amount, status } = req.query;
  const { message } = await paymentServices.successPayment(req);

  const url = `${ssl.success_client_url}?trxId=${trxId}&amount=${amount}&status=${status}&message=${message}`;

  res.redirect(url);
});

//
export const failPayment = catchAsync(async (req, res) => {
  const { trxId, amount, status } = req.query;
  const { message } = await paymentServices.failPayment(trxId as string);

  const url = `${ssl.fail_client_url}?trxId=${trxId}&amount=${amount}&status=${status}&message=${message}`;

  res.redirect(url);
});

//
export const cancelPayment = catchAsync(async (req, res) => {
  const { trxId, amount, status } = req.query;
  const { message } = await paymentServices.cancelPayment(trxId as string);

  const url = `${ssl.cancel_client_url}?trxId=${trxId}&amount=${amount}&status=${status}&message=${message}`;

  res.redirect(url);
});

//
export const repayment = catchAsync(async (req, res) => {
  const { options, message } = await paymentServices.repayment(req);

  _response(res, {
    message: message,
    meta: { options },
  });
});

//
export const getInvoiceUrl = catchAsync(async (req, res) => {
  const { data } = await paymentServices.getInvoiceUrl(
    req.params?.paymentId || "",
  );

  _response(res, {
    message: "Invoice url retrieved successfully!",
    data,
  });
});

//
export const validatePayment = catchAsync(async (req, res) => {
  await validationPayment(req.body);

  _response(res, {
    message: "Payment validated successfully!",
  });
});
