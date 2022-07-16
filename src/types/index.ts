export interface IBloggers {
  id: number;
  name: string | null;
  youtubeUrl: string | null;
}

export interface IPaginationResponse<Item> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount?: number;
  items?: Item[] | [];
}
