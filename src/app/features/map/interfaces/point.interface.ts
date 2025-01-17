export interface Points {
  data: Point[];
  meta: Meta;
}

export interface Point {
  id:            number;
  documentId:    string;
  id_point:      string;
  name:          string;
  description:   string;
  latitude:      number;
  createdAt:     Date;
  updatedAt:     Date;
  publishedAt:   Date;
  locale:        null;
  longitude:     number;
  id_category:   any[];
  images:        null;
  localizations: any[];
}

export interface Meta {
  pagination: Pagination;
}

export interface Pagination {
  page:      number;
  pageSize:  number;
  pageCount: number;
  total:     number;
}
