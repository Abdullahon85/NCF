// src/api/admin.ts
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "https://ncb-1.onrender.com/api";
//http://127.0.0.1:8001/api "https://ncb-r1l6.onrender.com/api"
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Для сессий
});

// Interceptor для CSRF токена
adminApi.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1];

  if (csrfToken) {
    config.headers["X-CSRFToken"] = csrfToken;
  }
  return config;
});

// ============ AUTH API ============
export const authAPI = {
  login: (username: string, password: string) =>
    adminApi.post("/admin/auth/login/", { username, password }),

  logout: () => adminApi.post("/admin/auth/logout/"),

  getMe: () => adminApi.get("/admin/auth/me/"),

  changePassword: (oldPassword: string, newPassword: string) =>
    adminApi.post("/admin/auth/change-password/", {
      old_password: oldPassword,
      new_password: newPassword,
    }),

  updateProfile: (data: {
    email?: string;
    first_name?: string;
    last_name?: string;
  }) => adminApi.patch("/admin/auth/profile/", data),
};

// ============ STATS API ============
export const statsAPI = {
  getDashboard: () => adminApi.get("/admin/stats/"),
};

// ============ FEATURES/TAGS BY CATEGORY ============
export const categoryDataAPI = {
  // Получить features, tags, tagNames, featureValues по категории (как в Django filter_features.js)
  getByCategory: (categoryId: number) =>
    adminApi.get("/features-tags-by-category/", {
      params: { category: categoryId },
    }),
};

// ============ CATEGORIES API ============
export const categoriesAdminAPI = {
  getAll: (params?: { search?: string; parent?: string | number }) =>
    adminApi.get("/admin/categories/", { params }),

  getById: (id: number) => adminApi.get(`/admin/categories/${id}/`),

  create: (data: any) => adminApi.post("/admin/categories/", data),

  update: (id: number, data: any) =>
    adminApi.patch(`/admin/categories/${id}/`, data),

  delete: (id: number) => adminApi.delete(`/admin/categories/${id}/`),

  uploadImage: (id: number, formData: FormData) =>
    adminApi.post(`/admin/categories/${id}/upload-image/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ============ BRANDS API ============
export const brandsAdminAPI = {
  getAll: (params?: { search?: string }) =>
    adminApi.get("/admin/brands/", { params }),

  getById: (id: number) => adminApi.get(`/admin/brands/${id}/`),

  create: (data: any) => adminApi.post("/admin/brands/", data),

  update: (id: number, data: any) =>
    adminApi.patch(`/admin/brands/${id}/`, data),

  delete: (id: number) => adminApi.delete(`/admin/brands/${id}/`),

  uploadLogo: (id: number, formData: FormData) =>
    adminApi.post(`/admin/brands/${id}/upload-logo/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ============ TAGS API ============
export const tagsAdminAPI = {
  getAll: (params?: { search?: string; category?: number }) =>
    adminApi.get("/admin/tags/", { params }),

  getById: (id: number) => adminApi.get(`/admin/tags/${id}/`),

  create: (data: any) => adminApi.post("/admin/tags/", data),

  update: (id: number, data: any) => adminApi.patch(`/admin/tags/${id}/`, data),

  delete: (id: number) => adminApi.delete(`/admin/tags/${id}/`),
};

// ============ TAG NAMES API ============
export const tagNamesAdminAPI = {
  getAll: (params?: { search?: string; category?: number }) =>
    adminApi.get("/admin/tag-names/", { params }),

  getById: (id: number) => adminApi.get(`/admin/tag-names/${id}/`),

  create: (data: any) => adminApi.post("/admin/tag-names/", data),

  update: (id: number, data: any) =>
    adminApi.patch(`/admin/tag-names/${id}/`, data),

  delete: (id: number) => adminApi.delete(`/admin/tag-names/${id}/`),
};

// ============ FEATURES API ============
export const featuresAdminAPI = {
  getAll: (params?: { search?: string; category?: number }) =>
    adminApi.get("/admin/features/", { params }),

  getById: (id: number) => adminApi.get(`/admin/features/${id}/`),

  create: (data: any) => adminApi.post("/admin/features/", data),

  update: (id: number, data: any) =>
    adminApi.patch(`/admin/features/${id}/`, data),

  delete: (id: number) => adminApi.delete(`/admin/features/${id}/`),
};

// ============ FEATURE VALUES API ============
export const featureValuesAdminAPI = {
  getAll: (params?: { search?: string; category?: number }) =>
    adminApi.get("/admin/feature-values/", { params }),

  getById: (id: number) => adminApi.get(`/admin/feature-values/${id}/`),

  create: (data: any) => adminApi.post("/admin/feature-values/", data),

  update: (id: number, data: any) =>
    adminApi.patch(`/admin/feature-values/${id}/`, data),

  delete: (id: number) => adminApi.delete(`/admin/feature-values/${id}/`),
};

// ============ NEWS API ============
export const newsAdminAPI = {
  getAll: (params?: { search?: string; is_published?: boolean }) =>
    adminApi.get("/admin/news/", { params }),

  getById: (id: number) => adminApi.get(`/admin/news/${id}/`),

  create: (data: any) => adminApi.post("/admin/news/", data),

  update: (id: number, data: any) => adminApi.patch(`/admin/news/${id}/`, data),

  delete: (id: number) => adminApi.delete(`/admin/news/${id}/`),
};

// ============ IMAGES API ============
export const imagesAdminAPI = {
  getAll: (params?: { product?: number }) =>
    adminApi.get("/admin/images/", { params }),

  create: (data: any) => adminApi.post("/admin/images/", data),

  update: (id: number, data: any) =>
    adminApi.patch(`/admin/images/${id}/`, data),

  delete: (id: number) => adminApi.delete(`/admin/images/${id}/`),
};

// ============ SETTINGS API ============
export const settingsAdminAPI = {
  getAbout: () => adminApi.get("/admin/about/"),

  updateAbout: (data: any) => adminApi.put("/admin/about/", data),

  getContact: () => adminApi.get("/admin/contact/"),

  updateContact: (data: any) => adminApi.put("/admin/contact/", data),
};

// ============ MESSAGES API ============
export const messagesAdminAPI = {
  getAll: (params?: { is_processed?: boolean }) =>
    adminApi.get("/admin/messages/", { params }),

  getById: (id: number) => adminApi.get(`/admin/messages/${id}/`),

  markProcessed: (id: number) =>
    adminApi.post(`/admin/messages/${id}/mark-processed/`),

  markUnprocessed: (id: number) =>
    adminApi.post(`/admin/messages/${id}/mark-unprocessed/`),

  delete: (id: number) => adminApi.delete(`/admin/messages/${id}/`),
};

// ============ PRODUCTS API ============
export const productsAdminAPI = {
  getAll: (params?: {
    search?: string;
    category?: number;
    brand?: number;
    is_available?: boolean;
    ordering?: string;
    page?: number;
    page_size?: number;
  }) => adminApi.get("/admin/products/", { params }),

  getById: (id: number) => adminApi.get(`/admin/products/${id}/`),

  create: (data: any) => adminApi.post("/admin/products/", data),

  update: (id: number, data: any) =>
    adminApi.patch(`/admin/products/${id}/`, data),

  delete: (id: number) => adminApi.delete(`/admin/products/${id}/`),

  uploadImage: (id: number, formData: FormData) =>
    adminApi.post(`/admin/products/${id}/upload-image/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteImage: (productId: number, imageId: number) =>
    adminApi.delete(`/admin/products/${productId}/delete-image/${imageId}/`),
};

export default adminApi;
