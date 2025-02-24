import { StrapiResponse } from '../interfaces/forum.interface';

export function normalizeResponse<T>(response: StrapiResponse<T>): T[] {
  return Array.isArray(response.data) ? response.data : [response.data];
}
