// lib/api-client.ts
var API_BASE_URL = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL ? import.meta.env.VITE_API_URL : "/api";
var ApiError = class extends Error {
  constructor(status, statusText, message) {
    super(message || `API Error: ${status} ${statusText}`);
    this.status = status;
    this.statusText = statusText;
    this.name = "ApiError";
  }
};
async function handleResponse(response) {
  if (!response.ok) {
    let message;
    try {
      const errorData = await response.json();
      message = errorData.message || errorData.error;
    } catch {
    }
    throw new ApiError(response.status, response.statusText, message);
  }
  const text = await response.text();
  if (!text) {
    return void 0;
  }
  return JSON.parse(text);
}
function getHeaders() {
  const headers = {
    "Content-Type": "application/json"
  };
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("authToken") : null;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}
var apiClient = {
  /**
   * GET request
   */
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: getHeaders()
    });
    return handleResponse(response);
  },
  /**
   * POST request
   */
  async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : void 0
    });
    return handleResponse(response);
  },
  /**
   * PUT request
   */
  async put(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : void 0
    });
    return handleResponse(response);
  },
  /**
   * PATCH request
   */
  async patch(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : void 0
    });
    return handleResponse(response);
  },
  /**
   * DELETE request
   */
  async delete(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

export { ApiError, apiClient };
