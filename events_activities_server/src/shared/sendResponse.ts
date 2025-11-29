import { Response } from "express";
import { sCode } from "../utils";

export default function _response<T>(
  res: Response,
  jsonData: {
    statusCode?: number;
    success?: boolean;
    message: string;
    meta?: {
      total_records?: number;
      filtered_records?: number;
      present_records?: number;
      total_pages?: number;
      present_page?: number;
      skip?: number;
      limit?: number;
      options?: Record<string, any>;
    };
    data?: T | null | undefined;
  },
) {
  res.status(jsonData.statusCode || sCode.OK).json({
    success: jsonData.success || true,
    message: jsonData.message,
    meta: jsonData.meta ?? null,
    data: jsonData.data ?? null,
  });
}
