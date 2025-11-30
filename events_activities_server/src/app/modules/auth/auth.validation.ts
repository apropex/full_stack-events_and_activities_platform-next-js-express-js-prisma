import z from "zod";

export const LoginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string({ error: "Enter a valid password" }),
});

export type iLoginPayload = z.infer<typeof LoginSchema>;

export const ResetPasswordSchema = z.object({
  oldPassword: z.string({ error: "Enter a valid old password" }),
  newPassword: z.string({ error: "New password must be a string type" }),
});

export type iResetPasswordPayload = z.infer<typeof ResetPasswordSchema>;

export const OtpOption = z.enum(["setOtp", "verifyOtp"]);

export const OtpVerifyPayloadSchema = z.object({
  email: z.email("Enter a valid email"),
  option: OtpOption,
  otp: z.string({ error: "otp must be string type" }).optional(),
});

export type iOtpVerifyPayload = z.infer<typeof OtpVerifyPayloadSchema>;
