import { Event, Prisma, Role } from "@prisma/client";
import { UploadApiResponse } from "cloudinary";
import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../../lib/ApiError";
import prisma from "../../../lib/prisma";
import { iQuery } from "../../../shared/global-query-interfaces";
import { sCode } from "../../../utils";
import configureQuery, {
  getSearchFilters,
} from "../../../utils/configureQuery";
import {
  eventBooleanFields,
  eventFilterFields,
  eventNumberFields,
  eventSearchFields,
} from "./event.constants";

//* CREATE EVENT *\\
export const createEvent = async (
  id: string,
  payload: Event,
  files: UploadApiResponse[] | null,
) => {
  if (!id) {
    throw new ApiError(
      sCode.BAD_REQUEST,
      "User id not found in the jwt payload, login again",
    );
  }

  return await prisma.$transaction(async (trx) => {
    const event = await trx.event.create({
      data: { ...payload, organizerId: id },
      include: { images: true },
    });

    if (files) {
      await Promise.allSettled(
        files.map((file) =>
          trx.eventImage.create({
            data: {
              eventId: event.id,
              url: file.secure_url,
              publicId: file.public_id,
            },
          }),
        ),
      );
    }

    return event;
  });
};

//* UPDATE EVENT *\\
export const updateEvent = async (
  decoded: JwtPayload,
  eventId: string,
  payload: Event,
) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });

  if (!event) throw new ApiError(sCode.NOT_FOUND, "Event not found");

  if (event.organizerId !== decoded.id || decoded.role !== Role.ADMIN) {
    throw new ApiError(
      sCode.BAD_REQUEST,
      "You are not permitted to update this event",
    );
  }

  return await prisma.event.update({ where: { id: eventId }, data: payload });
};

//* GET EVENT BY ID *\\
export const getEventById = async (id: string) => {
  return await prisma.event.findUniqueOrThrow({ where: { id } });
};

//* GET ALL EVENTS *\\
type WhereInput = Prisma.EventWhereInput;

export const getAllEvents = async (query: iQuery) => {
  const { page, take, skip, orderBy, search, filters } = configureQuery(query, {
    filterFields: eventFilterFields,
    booleanFields: eventBooleanFields,
    numberFields: eventNumberFields,
  });

  const { tags, date, price, maxPeople, ...restFilters } = filters;

  const where = getSearchFilters({
    searchFields: eventSearchFields,
    search,
    filters: { ...restFilters },
  }) as WhereInput;

  if (!Array.isArray(where?.AND)) where.AND = [];

  const tagsArray = (tags as string)
    ?.split(" ")
    .map((interest) => interest.trim())
    ?.filter((interest) => interest.length > 0);

  if (tagsArray && tagsArray.length > 0) {
    where.AND.push({
      tags: {
        hasSome: tagsArray,
      },
    });
  }

  if (date) {
    where.AND.push({
      date: { lte: new Date(date as string) },
    });
  }

  if (price) {
    where.AND.push({
      price: { lte: price as number },
    });
  }

  if (maxPeople) {
    where.AND.push({
      maxPeople: { lte: maxPeople as number },
    });
  }

  const include = {
    images: true,
    bookings: {
      include: {
        payment: true,
      },
    },
  };

  const [events, total_records, filtered_records] = await Promise.all([
    prisma.event.findMany({ where, orderBy, skip, take, include }),
    prisma.event.count(),
    prisma.event.count({ where }),
  ]);

  return {
    data: events,
    meta: {
      total_records,
      filtered_records,
      present_records: events.length ?? 0,
      total_pages: Math.ceil(filtered_records / take),
      present_page: page,
      skip,
      limit: take,
    },
  };
};

//* SOFT DELETE EVENT *\\
export const eventSoftDelete = async (userId: string, eventId: string) => {
  return await prisma.event.update({
    where: { id: eventId },
    data: {
      isDeleted: true,
      deletedBy: userId,
    },
  });
};

//* HARD DELETE EVENT *\\
export const eventHardDelete = async (id: string) => {
  await prisma.event.delete({ where: { id } });
};
