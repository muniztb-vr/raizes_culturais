import axios from "axios";

const api = axios.create({
  baseURL: "https://raizes-culturais-backend.onrender.com/api",
  headers: { "Content-Type": "application/json" },
  timeout: 90000, // 90s — Render free tier pode levar até 60s para acordar
});

export default api;
