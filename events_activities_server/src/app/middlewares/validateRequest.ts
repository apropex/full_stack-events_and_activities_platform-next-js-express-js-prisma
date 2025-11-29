import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export default function validateRequest(schema: ZodObject) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      req.body = await schema.parseAsync(
        req.body?.data ? JSON.parse(req.body?.data) : req.body
      );

      next();
    } catch (error) {
      next(error);
    }
  };
}
