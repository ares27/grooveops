import axios from "axios";
import { auth } from "../config/firebase";

const api = axios.create({
  // baseURL: "http://127.0.0.1:5000/api",
  baseURL: import.meta.env.VITE_API_URL,
});

// Add auth interceptor to include Firebase ID token in API requests
api.interceptors.request.use(
  async (config) => {
    try {
      // Get the current user from Firebase
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        // Get the ID token
        const token = await currentUser.getIdToken();
        if (token) {
          // Add it to the Authorization header
          config.headers.Authorization = `Bearer ${token}`;
          console.debug("✅ Auth token added to request:", config.url);
        }
      } else {
        console.warn("⚠️ No current user for API request");
      }
    } catch (error) {
      console.error("❌ Error getting auth token for API request:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const djService = {
  getAll: () => api.get("/djs"),
  getById: (id: string) => api.get(`/djs/${id}`),
  create: (djData: any) => api.post("/djs", djData),
  update: (id: string, djData: any) => api.put(`/djs/${id}`, djData),
  delete: (id: string) => api.delete(`/djs/${id}`),
};

export const eventService = {
  create: (eventData: any) => api.post("/events", eventData),
  getAll: () => api.get("/events"),
  getById: (id: string) => api.get(`/events/${id}`),
  update: (id: string, eventData: any) => api.put(`/events/${id}`, eventData),
  delete: (id: string) => api.delete(`/events/${id}`),
};

export const fetchDjById = async (id: string) => {
  const response = await djService.getById(id);
  return response.data;
};

export const updateDj = async (id: string, djData: any) => {
  const response = await djService.update(id, djData);
  return response.data;
};
