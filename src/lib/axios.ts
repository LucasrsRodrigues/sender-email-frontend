import axios from "axios";
import { env } from "@/env";

export const apiClient = axios.create({
  baseURL: env.VITE_API_URL
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});