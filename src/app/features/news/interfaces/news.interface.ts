export interface News {
  data: NewsItem[];
  meta?: any;
}

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  content: Content[];
  images: string[];
  sourceUrl?: string;
  sourceName?: string;
  articleType: 'regular' | 'topicFeatured' | 'topicSmall';
  createdAt: string;
  mainImage?: string;
  publishedAt?: string;
  articleDate?: string;
  author?: {
    username: string;
  };
  tags?: Tag[];
  pais?: string;
  featuredImage?: MediaItem;
  additionalImages?: MediaItem[];
  manualCreation?: boolean;
}

export interface MediaItem {
  url: string;
  alternativeText?: string;
  formats?: {
    thumbnail?: ImageFormat;
    small?: ImageFormat;
    medium?: ImageFormat;
    large?: ImageFormat;
  };
}

export interface ImageFormat {
  url: string;
  width: number;
  height: number;
}

export interface Content {
  type: string;
  children: {
    text: string;
    type?: string;
  }[];
}

export interface ImageData {
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
  createdAt:         string;
  updatedAt:         string;
  publishedAt:       string;
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

export interface Author {
  id:          number;
  documentId:  string;
  username:    string;
  email:       string;
  provider:    string;
  confirmed:   boolean;
  blocked:     boolean;
  createdAt:   string;
  updatedAt:   string;
  publishedAt: string;
  locale:      null;
}

export interface Tag {
  id:          number;
  documentId:  string;
  name:        string;
  nombre?:     string;
  createdAt:   string;
  updatedAt:   string;
  publishedAt: string;
  locale:      null;
  id_tag?:     string;
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
