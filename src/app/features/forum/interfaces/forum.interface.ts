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

// Topic interface (with timestamps)
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
}

// Updated Post interface to match Strapi schema
export interface Post {
  id: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  body: string;                    // Changed from 'content' to 'body'
  topic?: Topic;                   // Relation with Topic
  users_permissions_user?: User;   // Relation with User from users-permissions
}

// Add User interface for the users-permissions relation
interface User {
  id: number;
  username: string;
  // Add other user fields as needed
}