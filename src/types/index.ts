export interface IBloggers {
  id?: number;
  name?: string | null;
  youtubeUrl?: string | null;
}

export interface IPosts {
  shortDescription?: string;
  content?: string | null;
  title?: string | null;
  bloggerId?: number;
  bloggerName?: string | null;
  id?: number;
}
export interface IPaginationResponse<Item> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount?: number;
  items?: Item[] | [];
}
