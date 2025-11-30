//

//* GLOBAL QUERY INTERFACES *//

export type iQuery = Record<string, unknown>;

export interface iPaginationQuery {
  page?: string;
  limit?: string;
}

export interface iSearchQuery {
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

type iPaginationAndSearchQuery = iPaginationQuery & iSearchQuery;

//* USER QUERY INTERFACE
export interface iUserSearchQuery extends iPaginationAndSearchQuery {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  role: string;
  bio: string;
  interests: string;
  status: string;
  isVerified: string;
  isDeleted: string;
  isPremium: string;
}

//* USER EVENT INTERFACE
export interface iEventSearchQuery {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  isPremium: string;
  price: string;
  maxPeople: string;
  category: string;
  tags: string;
  approveStatus: string;
  status: string;
  type: string;
  organizerId: string;
}
