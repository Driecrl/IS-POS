export interface ApiErrorResponse {
  status: "error";
  message: string;
  issues?: unknown;
}