import { User } from "./user.interface";

export interface AuthResponse {
  jwt:  string;
  user: User;
}
