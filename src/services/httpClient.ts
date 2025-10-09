export interface RequestOptions extends RequestInit {
  data?: unknown;
  noSucTip?: boolean;
  sucMsg?: string;
  errorMsg?: string;
  noTip?: boolean;
  arrayBuffer?: boolean;
}

export interface RequestResult<T> {
  code: number;
  success: boolean;
  message: string;
  data: T;
}

class HttpError extends Error {
  public readonly status: number;
  public readonly response?: unknown;

  constructor(message: string, status: number, response?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.response = response;
  }
}

async function parseResponseBody(response: Response, expectArrayBuffer?: boolean) {
  if (expectArrayBuffer) {
    return response.arrayBuffer();
  }

  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
}

export async function request<T>(
  url: string,
  { data, arrayBuffer, headers, ...rest }: RequestOptions = {},
): Promise<RequestResult<T>> {
  const method = rest.method?.toUpperCase() ?? (data ? "POST" : "GET");
  const requestHeaders = new Headers(headers);
  let body: BodyInit | undefined;

  if (data instanceof FormData) {
    body = data;
  } else if (data !== undefined && data !== null && method !== "GET") {
    requestHeaders.set("Content-Type", "application/json");
    body = JSON.stringify(data);
  }

  const response = await fetch(url, {
    ...rest,
    method,
    headers: requestHeaders,
    body,
  });

  const payload = await parseResponseBody(response, arrayBuffer);

  if (!response.ok) {
    const errorMessage =
      (payload && typeof payload === "object" && "message" in payload
        ? (payload as { message?: string }).message
        : undefined) ||
      response.statusText ||
      "Request failed";

    throw new HttpError(errorMessage, response.status, payload);
  }

  if (payload && typeof payload === "object" && "code" in payload) {
    return payload as RequestResult<T>;
  }

  return {
    code: response.status,
    success: true,
    message:
      (payload && typeof payload === "object" && "message" in payload
        ? (payload as { message?: string }).message
        : ""),
    data: (payload && typeof payload === "object" && "data" in payload
      ? (payload as { data: T }).data
      : (payload as T)),
  };
}

export function get<T>(url: string, options?: RequestOptions) {
  return request<T>(url, { ...options, method: "GET" });
}

export function post<T>(url: string, data?: unknown, options?: RequestOptions) {
  return request<T>(url, { ...options, method: "POST", data });
}

export function put<T>(url: string, data?: unknown, options?: RequestOptions) {
  return request<T>(url, { ...options, method: "PUT", data });
}

export function patch<T>(url: string, data?: unknown, options?: RequestOptions) {
  return request<T>(url, { ...options, method: "PATCH", data });
}

export function del<T>(url: string, options?: RequestOptions) {
  return request<T>(url, { ...options, method: "DELETE" });
}

export function upload<T>(url: string, data: FormData, options?: RequestOptions) {
  return request<T>(url, { ...options, method: "POST", data });
}

export { HttpError };
