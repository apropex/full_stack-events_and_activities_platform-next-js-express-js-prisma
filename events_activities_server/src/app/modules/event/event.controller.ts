import { UploadApiResponse } from "cloudinary";
import { multiFileUploaderToCloud } from "../../../lib/fileUploader";
import catchAsync from "../../../shared/catchAsync";
import _response from "../../../shared/sendResponse";
import * as eventServices from "./event.service";

export const createEvent = catchAsync(async (req, res) => {
  let files: UploadApiResponse[] | null = null;

  if (Array.isArray(req.files) && req.files.length) {
    const uploadResult = await multiFileUploaderToCloud(req.files);
    if (uploadResult.length) files = uploadResult;
  }

  const result = await eventServices.createEvent(
    req.decoded?.id,
    req.body,
    files,
  );
  _response(res, {
    message: "Event created successfully!",
    data: result,
  });
});

export const updateEvent = catchAsync(async (req, res) => {
  let files: UploadApiResponse[] | null = null;

  if (Array.isArray(req.files) && req.files.length) {
    const uploadResult = await multiFileUploaderToCloud(req.files);
    if (uploadResult.length) files = uploadResult;
  }

  const result = await eventServices.updateEvent(
    req.decoded!,
    req.params.id,
    req.body,
    files,
  );
  _response(res, {
    message: "Event updated successfully!",
    data: result,
  });
});

export const getEventById = catchAsync(async (req, res) => {
  const result = await eventServices.getEventById(req.params.id);
  _response(res, {
    message: "Event retrieved successfully!",
    data: result,
  });
});

export const getAllEvents = catchAsync(async (req, res) => {
  const { data, meta } = await eventServices.getAllEvents(req.query);
  _response(res, {
    message: "Events retrieved successfully!",
    data,
    meta,
  });
});

export const eventSoftDelete = catchAsync(async (req, res) => {
  await eventServices.eventSoftDelete(req.decoded?.id, req.params.id);
  _response(res, {
    message: "Event deleted successfully!",
  });
});

export const eventHardDelete = catchAsync(async (req, res) => {
  await eventServices.eventHardDelete(req.params.id);
  _response(res, {
    message: "Event deleted successfully!",
  });
});
