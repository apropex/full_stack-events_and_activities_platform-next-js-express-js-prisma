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

//* USER QUERY INTERFACES
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
