const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");
const TOKEN_KEY = "portfolio_token";

export function resolveAssetUrl(imageUrl) {
  if (!imageUrl) return "";

  try {
    const url = new URL(imageUrl, window.location.origin);
    if (
      ["localhost", "127.0.0.1"].includes(url.hostname) &&
      url.port === "5000"
    ) {
      return `${API_ORIGIN}${url.pathname}${url.search}`;
    }
  } catch {
    throw new Error("Invalid image URL.");
  }

  return imageUrl;
}

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...(options.body && !isFormData ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status}).`);
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
  upload: (path, formData) =>
    request(path, { method: "POST", body: formData }),
  put: (path, body) =>
    request(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const hasToken = () => Boolean(localStorage.getItem(TOKEN_KEY));
