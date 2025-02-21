export interface News {
  data: NewsItem[];
  meta: Meta;
}

export interface NewsItem {
  id:            number;
  documentId:    string;
  fecha:         Date;
  createdAt:     Date;
  updatedAt:     Date;
  publishedAt:   Date;
  locale:        null;
  title:         null | string;
  content:       Content[];
  summary:       null;
  imagen:        Imagen | null;
  autor:         Autor;
  tags:          Tag[];
  localizations: any[];
}

export interface Autor {
  id:          number;
  documentId:  string;
  username:    string;
  email:       string;
  provider:    string;
  confirmed:   boolean;
  blocked:     boolean;
  createdAt:   Date;
  updatedAt:   Date;
  publishedAt: Date;
  locale:      null;
}

export interface Content {
  type:     string;
  children: Child[];
}

export interface Child {
  text: string;
  type: string;
}

export interface Imagen {
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
  small:     Medium;
  medium:    Medium;
  thumbnail: Medium;
}

export interface Medium {
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

export interface Tag {
  id:          number;
  documentId:  string;
  name:        string;
  createdAt:   Date;
  updatedAt:   Date;
  publishedAt: Date;
  locale:      null;
  id_tag:      string;
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
