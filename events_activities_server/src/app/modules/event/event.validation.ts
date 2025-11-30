import { EventStatus, EventType } from "@prisma/client";
import z from "zod";

export const EventPayloadSchema = z
  .object({
    title: z.string().trim().min(1, { message: "Title is required" }),

    description: z
      .string()
      .trim()
      .min(1, { message: "Description is required" }),

    location: z.string().trim().min(1, { message: "Location is required" }),

    // Accept string but must be valid date
    date: z
      .string()
      .trim()
      .min(1, { message: "Date is required" })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
      }),

    isPremium: z.boolean().optional().default(false),

    price: z
      .number()
      .min(0, { message: "Price cannot be negative" })
      .optional()
      .default(0),

    maxPeople: z
      .number()
      .int({ message: "Max people must be an integer" })
      .min(1, { message: "Max people must be at least 1" }),

    category: z.string().trim().min(1, { message: "Category is required" }),

    tags: z
      .array(z.string().trim().min(1, { message: "Tag cannot be empty" }))
      .min(1, { message: "At least one tag is required" }),

    status: z.enum(Object.values(EventStatus) as [string, ...string[]], {
      message: "Enter a valid status",
    }),

    type: z.enum(Object.values(EventType) as [string, ...string[]], {
      message: "Enter a valid type",
    }),
  })
  // Custom Business Rule: isPremium = true ⇒ price ≥ 1 required
  .superRefine((data, ctx) => {
    if (data.isPremium && data.price <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Premium events must have a price greater than 0",
        path: ["price"],
      });
    }
  });
