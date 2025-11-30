import z from "zod";
import { PasswordSchema } from "../../../shared/password_schema";

export const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  password: PasswordSchema,
  phone: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  bio: z.string().max(160, "Bio must be maximum 160 characters").optional(),
  interests: z.array(z.string()).optional(),
});

export type CreateUserPayload = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  phone: z.string().optional(),
  bio: z.string().max(160, "Bio must be maximum 160 characters").optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  interests: z.array(z.string()).optional(),
});

export type UpdateUserPayload = z.infer<typeof UpdateUserSchema>;
