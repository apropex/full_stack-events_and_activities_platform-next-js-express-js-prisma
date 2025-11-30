//* QUERY CONFIGURATION *\\

import { iQuery } from "../shared/global-query-interfaces";
import { checkBooleanAndNumber } from "./fieldsChecker";
import pickQuery from "./pickQuery";

//* CONFIGURE QUERY

interface iOptions<K> {
  filterFields: K[];
  booleanFields?: K[];
  numberFields?: K[];
}

export default function configureQuery<
  T extends Record<string, unknown>,
  K extends keyof T,
>(query: T, options: iOptions<K>) {
  const { limit, sortBy, sortOrder, search = "" } = query;

  const filteredQuery = checkBooleanAndNumber(query, {
    booleanFields: options.booleanFields,
    numberFields: options.numberFields,
  });

  const filters = pickQuery(filteredQuery, ...options.filterFields);

  const page = Number(query.page || "1");
  const take = Number(limit || "12");
  const skip = (page - 1) * take;
  const orderBy = {
    [(sortBy as string) || "createdAt"]: sortOrder === "asc" ? "asc" : "desc",
  };

  return { page, take, skip, orderBy, search: search as string, filters };
}

//* GET SEARCH FILTERS
interface iWhereInputs {
  OR: { [key: string]: { contains: string; mode: "insensitive" } }[] | any;
  AND: { [key: string]: string }[];
}

interface iProps {
  searchFields?: string[];
  search?: string;
  filters?: iQuery;
}

export function getSearchFilters<T extends iWhereInputs>({
  searchFields,
  search,
  filters,
}: iProps): T {
  const where: T = {} as T;

  if (search && Array.isArray(searchFields)) {
    where.OR = searchFields.map((field) => {
      let a = { contains: search as string, mode: "insensitive" };

      field
        .split(".")
        .reverse()
        .map((f) => {
          a = { [f]: a } as any;
        });

      return a;
    });
  }

  if (filters && Object.keys(filters).length) {
    where.AND = Object.keys(filters).map((key) => {
      const value = (filters as Record<string, string>)[key];

      let a: any = value;

      key
        .split(".")
        .reverse()
        .forEach((k) => {
          a = { [k]: a };
        });

      return a;
    });
  }

  return where;
}
