import { z } from "zod";
import { OTP_LENGTH, PIN_LENGTH } from "./constants";

export const mobileSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number (starts with 6–9)");

export const pinSchema = z
  .string()
  .regex(new RegExp(`^\\d{${PIN_LENGTH}}$`), `PIN must be exactly ${PIN_LENGTH} digits`);

export const otpSchema = z
  .string()
  .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `OTP must be exactly ${OTP_LENGTH} digits`);

export const checkMobileSchema = z.object({ mobile: mobileSchema });

export const loginSchema = z.object({ mobile: mobileSchema, pin: pinSchema });

export const sendOtpSchema = z.object({
  mobile: mobileSchema,
  purpose: z.enum(["setup", "forgot_pin"]),
});

export const verifyOtpSchema = z.object({
  mobile: mobileSchema,
  otp: otpSchema,
  purpose: z.enum(["setup", "forgot_pin"]),
});

const pinConfirmShape = {
  pin: pinSchema,
  confirmPin: pinSchema,
  otpProofToken: z.string().min(10),
};

export const setupPinSchema = z
  .object(pinConfirmShape)
  .refine((data) => data.pin === data.confirmPin, {
    message: "PINs do not match",
    path: ["confirmPin"],
  });

export const forgotPinResetSchema = z
  .object(pinConfirmShape)
  .refine((data) => data.pin === data.confirmPin, {
    message: "PINs do not match",
    path: ["confirmPin"],
  });
