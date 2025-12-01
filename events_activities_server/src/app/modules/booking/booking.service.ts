import { Booking, BookingStatus, PaymentStatus } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../../lib/ApiError";
import prisma from "../../../lib/prisma";
import { sCode } from "../../../utils";
import { generateTrxID } from "../../../utils/trxIDgenerator";
import { sslPaymentInit } from "../sslCommerz/sslCommerz.service";

export const createBooking = async (decoded: JwtPayload, payload: Booking) => {
  const { id, name, email, phone, address } = decoded;

  if (!id) {
    throw new ApiError(sCode.BAD_REQUEST, "User id not found, login again");
  }

  if (!phone || !address) {
    throw new ApiError(
      sCode.BAD_REQUEST,
      "Please complete your profile with phone and address",
    );
  }

  const event = await prisma.event.findUniqueOrThrow({
    where: { id: payload.eventId },
  });

  if (event.maxPeople <= event.totalBooked) {
    throw new ApiError(sCode.BAD_REQUEST, "Maximum people exceeded");
  }

  const isPremium = event.isPremium === true && event.price > 0;

  return await prisma.$transaction(async (trx) => {
    const booking = await trx.booking.create({
      data: {
        ...payload,
        status: isPremium ? BookingStatus.PENDING : BookingStatus.CONFIRMED,
      },
    });

    if (!isPremium) {
      await trx.event.update({
        where: { id: event.id },
        data: { totalBooked: { increment: 1 } },
      });
      return booking;
    }

    const payment = await trx.payment.create({
      data: {
        amount: event.price,
        trxId: generateTrxID(),
        status: PaymentStatus.PENDING,
      },
    });

    await trx.booking.update({
      where: { id: booking.id },
      data: {
        paymentId: payment.id,
      },
    });

    const sslPayment = await sslPaymentInit({
      amount: payment.amount,
      trxId: payment.trxId,
      name,
      email,
      phone,
      address,
    });

    return {
      data: booking,
      options: { paymentURL: sslPayment?.GatewayPageURL },
    };
  });
};
