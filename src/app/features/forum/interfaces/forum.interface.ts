// Strapi response wrapper interface
export interface StrapiResponse<T> {
  data: T | T[];  // Can be single object or array
  meta: any;
}

// Add Category interface
export interface Category {
  id: number;
  name: string;
}

// Update Subcategory interface to include category relation
export interface Subcategory {
  id: number;
  name: string;
  category?: Category;  // Add the relation to Category
}

// Add Media interface for Strapi media type
export interface Media {
  id: number;
  url: string;
  name: string;
  mime: string;
  size: number;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: {
      url: string;
      width: number;
      height: number;
    };
    // Add other format sizes if needed (medium, small, etc.)
  };
}

// Topic interface
export interface Topic {
  id: number;
  createdAt: string;
  documentId: string;
  locale: string | null;
  name: string;
  body: string;
  closed: boolean | null;
  pinned: boolean;
  publishedAt: string;
  updatedAt: string;
  subcategory?: Subcategory;
  posts?: Post[];
  users_permissions_user?: User;
  images?: Media[];
}

// Post interface
export interface Post {
  id: number;
  body: string;
  topic?: Topic;  // Changed from number to Topic
  post?: Post;    // Changed from number to Post (self-reference)
  posts?: Post[]; // Array of reply posts
  images?: Media[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  users_permissions_user?: User;
}

// Add User interface for the users-permissions relation
interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  lastName: string;
  lastName2: string;
  institution: string;
  // Add other user fields as needed
}

