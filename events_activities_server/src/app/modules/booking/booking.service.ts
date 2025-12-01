import { Booking, BookingStatus, PaymentStatus, Prisma } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../../lib/ApiError";
import prisma from "../../../lib/prisma";
import { iQuery } from "../../../shared/global-query-interfaces";
import { sCode } from "../../../utils";
import configureQuery from "../../../utils/configureQuery";
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
      return {
        data: booking,
        options: {},
      };
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
        trxId: payment.trxId,
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

export const updateBookingStatus = async (id: string, payload: Booking) => {
  return await prisma.booking.update({
    where: { id },
    data: { status: payload.status },
  });
};

export const getBookingById = async (id: string) => {
  return await prisma.booking.findFirstOrThrow({ where: { id } });
};

type WhereInput = Prisma.BookingWhereInput;

export const getMyBookings = async (id: string, query: iQuery) => {
  const { page, take, skip, orderBy } = configureQuery(query);

  const where = {} as WhereInput;

  where.AND = [{ id }];

  if (query.trxId) where.AND.push({ trxId: query.trxId });
  if (query.eventId) where.AND.push({ eventId: query.eventId });
  if (query.status) where.AND.push({ status: query.status });
  if (query.paymentId) where.AND.push({ paymentId: query.paymentId });

  const include = {
    payment: true,
  };

  const [bookings, total_records, filtered_records] = await Promise.all([
    prisma.booking.findMany({ where, orderBy, skip, take, include }),
    prisma.booking.count(),
    prisma.booking.count({ where }),
  ]);

  return {
    data: bookings,
    meta: {
      total_records,
      filtered_records,
      present_records: bookings.length ?? 0,
      total_pages: Math.ceil(filtered_records / take),
      present_page: page,
      skip,
      limit: take,
    },
  };
};

export const getAllBookings = async (query: iQuery) => {
  const { page, take, skip, orderBy } = configureQuery(query);

  const where = {} as WhereInput;

  where.AND = [];

  if (query.trxId) where.AND.push({ trxId: query.trxId });
  if (query.eventId) where.AND.push({ eventId: query.eventId });
  if (query.status) where.AND.push({ status: query.status });
  if (query.paymentId) where.AND.push({ paymentId: query.paymentId });

  const include = {
    payment: true,
  };

  const [bookings, total_records, filtered_records] = await Promise.all([
    prisma.booking.findMany({ where, orderBy, skip, take, include }),
    prisma.booking.count(),
    prisma.booking.count({ where }),
  ]);

  return {
    data: bookings,
    meta: {
      total_records,
      filtered_records,
      present_records: bookings.length ?? 0,
      total_pages: Math.ceil(filtered_records / take),
      present_page: page,
      skip,
      limit: take,
    },
  };
};
