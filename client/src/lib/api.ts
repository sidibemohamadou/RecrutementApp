// Legacy API functions - use apiRequest from queryClient instead
import { apiRequest } from "./queryClient";

export async function apiPost(url: string, data: unknown): Promise<any> {
  const response = await apiRequest("POST", url, data);
  return response.json();
}

export async function apiPut(url: string, data: unknown): Promise<any> {
  const response = await apiRequest("PUT", url, data);
  return response.json();
}

export async function apiGet(url: string): Promise<any> {
  const response = await apiRequest("GET", url);
  return response.json();
}

export async function apiDelete(url: string): Promise<any> {
  const response = await apiRequest("DELETE", url);
  return response.json();
}