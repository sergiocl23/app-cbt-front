export interface Points {
  data: Point[];
  meta: Meta;
}

export interface Point {
  id:            number;
  documentId:    string;
  name:          string;
  description:   string;
  latitude:      number;
  createdAt:     Date;
  updatedAt:     Date;
  publishedAt:   Date;
  locale:        null;
  longitude:     number;
  images:        null;
  id_categories: IDCategory[];
  main_image:    MainImage | null;
  localizations: any[];
}

export interface IDCategory {
  id:          number;
  documentId:  string;
  name:        string;
  description: string;
  createdAt:   Date;
  updatedAt:   Date;
  publishedAt: Date;
  locale:      null;
  icon:        string;
  icon_size:   number;
}

export interface MainImage {
  id:                number;
  documentId:        string;
  name:              string;
  alternativeText:   null;
  caption:           null;
  width:             number;
  height:            number;
  formats:           Formats;
  hash:              string;
  ext:               string;
  mime:              string;
  size:              number;
  url:               string;
  previewUrl:        null;
  provider:          string;
  provider_metadata: null;
  createdAt:         Date;
  updatedAt:         Date;
  publishedAt:       Date;
  locale:            null;
}

export interface Formats {
  large:     Format;
  small:     Format;
  medium:    Format;
  thumbnail: Format;
}

export interface Format {
  ext:         string;
  url:         string;
  hash:        string;
  mime:        string;
  name:        string;
  path:        null;
  size:        number;
  width:       number;
  height:      number;
  sizeInBytes: number;
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
