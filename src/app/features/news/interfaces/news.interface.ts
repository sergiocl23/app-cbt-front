export interface News {
  data: NewsItem[];
  meta: Meta;
}

export interface NewsItem {
  id:          number;
  documentId:  string;
  titulo:      string;
  descripcion: Descripcion[];
  fecha:       Date;
  createdAt:   Date;
  updatedAt:   Date;
  publishedAt: Date;
  locale:      null;
  imagen:      Imagen;
}

export interface Descripcion {
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

export interface Meta {
  pagination: Pagination;
}

export interface Pagination {
  page:      number;
  pageSize:  number;
  pageCount: number;
  total:     number;
}
