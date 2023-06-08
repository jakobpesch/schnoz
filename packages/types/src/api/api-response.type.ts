import { ErrorResponse } from "./error-response.interface";

export type ApiResponse<Data = unknown> = Data | ErrorResponse;
