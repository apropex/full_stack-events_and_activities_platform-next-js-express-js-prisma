/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import ApiError from "../../../lib/ApiError";
import env from "../../../lib/config/env";
import prisma from "../../../lib/prisma";
import { sCode } from "../../../utils";
import { iSSLCommerz } from "./sslCommerz.interface";

const ssl = env.ssl;

export const sslPaymentInit = async (payload: iSSLCommerz) => {
  const urlWithTrxID = (link: string, status = "success") =>
    `${link}?trxId=${payload.trxId}&amount=${payload.amount}&status=${status}`;

  const data = {
    store_id: ssl.store_id,
    store_passwd: ssl.store_pass,
    total_amount: payload.amount,
    currency: "BDT",
    tran_id: payload.trxId,
    success_url: urlWithTrxID(ssl.success_server_url),
    fail_url: urlWithTrxID(ssl.fail_server_url, "fail"),
    cancel_url: urlWithTrxID(ssl.cancel_server_url, "cancel"),
    ipn_url: ssl.ipn_url,
    shipping_method: "N/A",
    product_name: "Tour",
    product_category: "Service",
    product_profile: "general",
    cus_name: payload.name,
    cus_email: payload.email,
    cus_add1: payload.address,
    cus_add2: "N/A",
    cus_city: "N/A",
    cus_state: "N/A",
    cus_postcode: "N/A",
    cus_country: "Bangladesh",
    cus_phone: payload.phone,
    cus_fax: payload.phone,
    ship_name: "N/A", // Customer Name
    ship_add1: "N/A",
    ship_add2: "N/A",
    ship_city: "N/A",
    ship_state: "N/A",
    ship_postcode: 1000,
    ship_country: "N/A",
  };

  //
  try {
    const response = await axios({
      method: "POST",
      url: ssl.payment_api,
      data,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data;
  } catch (error: any) {
    console.log("Payment error accrued: ", error);
    throw new ApiError(sCode.BAD_REQUEST, error?.message);
  }
};

export const validationPayment = async (payload: Record<string, string>) => {
  try {
    const { data } = await axios({
      method: "GET",
      url: `${ssl.validation_api}?val_id=${payload.val_id}&store_id=${ssl.store_id}&store_passwd=${ssl.store_pass}`,
    });

    await prisma.payment.update({
      where: { trxId: payload.tran_id },
      data: { paymentInfo: data },
    });
  } catch (error: any) {
    throw new ApiError(401, `Payment validation Error: ${error.message}`);
  }
};
