const DEFAULT_API_BASE_URL = "https://c47hd3b2-3000.usw3.devtunnels.ms/api";
const RAW_API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "");

function isAbsoluteUrl(path) {
  return /^https?:\/\//i.test(path);
}

function withBaseUrl(path) {
  if (isAbsoluteUrl(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

function buildQueryString(query) {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    params.append(key, String(value));
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

async function parseResponseBody(response) {
  if (response.status === 204) {
    return null;
  }

  const rawText = await response.text();
  if (!rawText) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!isJson) {
    return rawText;
  }

  try {
    return JSON.parse(rawText);
  } catch {
    return rawText;
  }
}

function extractErrorMessage(data, status, fallbackMessage) {
  if (data && typeof data === "object" && typeof data.message === "string") {
    return data.message;
  }

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (fallbackMessage) {
    return fallbackMessage;
  }

  return `Request failed with status ${status}`;
}

export class ApiError extends Error {
  constructor(message, { status = 0, data = null, cause } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;

    if (cause) {
      this.cause = cause;
    }
  }
}

export async function apiRequest(
  path,
  {
    method = "GET",
    data,
    headers = {},
    token,
    query,
    signal,
    errorMessage,
    ...rest
  } = {}
) {
  const url = `${withBaseUrl(path)}${buildQueryString(query)}`;
  const requestHeaders = { ...headers };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  if (data !== undefined && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const requestInit = {
    method,
    headers: requestHeaders,
    signal,
    ...rest,
  };

  if (data !== undefined) {
    requestInit.body = JSON.stringify(data);
  }

  let response;
  try {
    response = await fetch(url, requestInit);
  } catch (error) {
    throw new ApiError(
      errorMessage || "No se pudo conectar con el servidor. Revisa la URL del API.",
      { cause: error }
    );
  }

  const responseData = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(responseData, response.status, errorMessage), {
      status: response.status,
      data: responseData,
    });
  }

  return responseData;
}

export const api = {
  request: apiRequest,
  get: (path, options = {}) => apiRequest(path, { ...options, method: "GET" }),
  post: (path, data, options = {}) => apiRequest(path, { ...options, method: "POST", data }),
  put: (path, data, options = {}) => apiRequest(path, { ...options, method: "PUT", data }),
  patch: (path, data, options = {}) => apiRequest(path, { ...options, method: "PATCH", data }),
  delete: (path, options = {}) => apiRequest(path, { ...options, method: "DELETE" }),
};

export { API_BASE_URL };
