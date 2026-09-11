export interface HealthResponse {
  readonly status: 'ok';
}

export interface ApiErrorResponse {
  readonly statusCode: number;
  readonly message: string | readonly string[];
  readonly timestamp: string;
  readonly path: string;
}
