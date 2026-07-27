import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@workspace/api-client-react";

// In production (static hosting), the frontend and API live on different
// origins. Set VITE_API_URL at build time (e.g. https://your-api.fly.dev)
// so API calls go to the deployed backend. In local dev this is unset and
// requests use relative /api paths, which the Vite dev proxy forwards.
const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl) {
  setBaseUrl(apiUrl);
}

createRoot(document.getElementById("root")!).render(<App />);
