import { API_ERROR_CODES } from "./api-error-codes.enum";
import { ApiResponse } from "./api-response.type";

export interface ErrorResponse {
  statusCode: number;
  error: API_ERROR_CODES | string;
  message: API_ERROR_CODES | string;
}

export function isErrorResponse(response: unknown): response is ErrorResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    "statusCode" in response &&
    typeof response["statusCode"] === "number" &&
    "message" in response &&
    (typeof response["message"] === "number" ||
      typeof response["message"] === "string")
  );
}

export function isDataResponse<T>(response: ApiResponse<T>): response is T {
  return !isErrorResponse(response);
}
