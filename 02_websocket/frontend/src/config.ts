const hostname = window.location.hostname;

let baseURL = "";
if (hostname === "localhost" || hostname === "127.0.0.1") {
  baseURL = "http://localhost:8000";
} else {
  baseURL = "https://your-production-domain.com";
}

export const API_BASE_URL = baseURL;
