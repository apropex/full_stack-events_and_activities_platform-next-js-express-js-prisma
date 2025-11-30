import { randomInt } from "crypto";

export const generateOtp = (length = 6) =>
  Array.from({ length }, () => randomInt(0, 10)).join("");

export const OTP = (length = 6): string =>
  Math.random()
    .toString(36)
    .toUpperCase()
    .slice(2, length + 2);

//* generateOtp returns a 6 digits of random numbers, Like: "943105" // or depends on length

//* OTP returns a 6 digits of random number(s) and sting, Like: "A7KBC3" // or depends on length
