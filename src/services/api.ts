import axios from "axios";

const api = axios.create({
  // baseURL: "http://127.0.0.1:5000/api",
  baseURL: import.meta.env.VITE_API_URL,
});

export const djService = {
  getAll: () => api.get("/djs"),
  create: (djData: any) => api.post("/djs", djData),
  delete: (id: string) => api.delete(`/djs/${id}`),
};

export const eventService = {
  create: (eventData: any) => api.post("/events", eventData),
  getAll: () => api.get("/events"),
  getById: (id: string) => api.get(`/events/${id}`),
  delete: (id: string) => api.delete(`/events/${id}`),
};
