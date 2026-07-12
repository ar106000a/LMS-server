export interface GetCoursesDto {
  page: number;
  limit: number;
  search?: string;
  sort: "createdAt" | "price" | "title";
  order: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
}
