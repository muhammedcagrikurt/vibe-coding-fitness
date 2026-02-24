import axios from "axios";
import { supabase } from "./supabaseClient";
import { toast } from "react-hot-toast";
// navigation helper for redirection

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
});

api.interceptors.request.use(async (config) => {
  const session = supabase.auth.session();
  if (session?.access_token && config.headers) {
    config.headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        supabase.auth.signOut();
        // redirect to login page
        window.location.href = "/";
      }
      if (!import.meta.env.PROD) console.error(error);
      toast.error(error.response.data?.detail || "An error occurred");
    } else {
      if (!import.meta.env.PROD) console.error(error);
      toast.error("Network error");
    }
    return Promise.reject(error);
  }
);

export default api;
