import { iEventSearchQuery } from "../../../shared/global-query-interfaces";

//* PATIENT CONSTANTS *\\
type iEvent = (keyof iEventSearchQuery)[];

export const eventFilterFields: iEvent = [
  "id",
  "date",
  "isPremium",
  "price",
  "maxPeople",
  "category",
  "tags",
  "approveStatus",
  "status",
  "type",
  "organizerId",
];
export const eventSearchFields: iEvent = ["title", "description", "location"];
export const eventBooleanFields: iEvent = ["isPremium"];
export const eventNumberFields: iEvent = ["price", "maxPeople"];
