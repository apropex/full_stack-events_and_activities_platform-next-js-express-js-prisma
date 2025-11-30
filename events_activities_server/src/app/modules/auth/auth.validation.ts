import z from "zod";
import { PasswordSchema } from "../../../shared/password_schema";

export const LoginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string({ error: "Enter a valid password" }),
});

export type iLoginPayload = z.infer<typeof LoginSchema>;

export const ResetPasswordSchema = z.object({
  oldPassword: z.string({ error: "Enter a valid old password" }),
  newPassword: PasswordSchema,
});

export type iResetPasswordPayload = z.infer<typeof ResetPasswordSchema>;

export const OtpOption = z.enum(["setOtp", "verifyOtp"]);

export const OtpVerifyPayloadSchema = z.object({
  email: z.email("Enter a valid email"),
  option: OtpOption,
  otp: z.string({ error: "otp must be string type" }).optional(),
});

export type iOtpVerifyPayload = z.infer<typeof OtpVerifyPayloadSchema>;

export const ResetForgotPasswordPayloadSchema = z.object({
  newPassword: PasswordSchema,
});
