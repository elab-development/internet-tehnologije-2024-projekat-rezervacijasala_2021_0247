import axios from "axios";

const api = axios.create({
  baseURL:  "http://localhost:8000/api",
  withCredentials: false,
});

// U svaki request ubacujemo Bearer token iz localStorage
api.interceptors.request.use((config) => {
  const t = localStorage.getItem("token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// Ako dobijemo 401, čistimo keš  
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user"); 
    }
    return Promise.reject(err);
  }
);

export default api;
