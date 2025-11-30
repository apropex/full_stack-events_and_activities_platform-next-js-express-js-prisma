import { iUserSearchQuery } from "../../../shared/global-query-interfaces";

//* PATIENT CONSTANTS *\\
type iUser = (keyof iUserSearchQuery)[];

export const userFilterFields: iUser = [
  "id",
  "gender",
  "role",
  "interests",
  "status",
  "isVerified",
  "isDeleted",
  "isPremium",
];
export const userSearchFields: iUser = ["name", "email", "phone", "bio"];
export const userBooleanFields: iUser = [
  "isVerified",
  "isDeleted",
  "isPremium",
];
