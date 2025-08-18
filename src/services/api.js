import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = "https://images-storage-nestjs-production.up.railway.app/"; // Backend URL

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("auth_token");
      Cookies.remove("user_data");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (email, name, password) => {
    const response = await api.post("/auth/register", {
      email,
      name,
      password,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.patch("/auth/profile", data);
    return response.data;
  },
};

// Files API
export const filesAPI = {
  uploadFile: async (file, options = {}) => {
    const formData = new FormData();
    formData.append("file", file);

    if (options.name) formData.append("name", options.name);
    if (options.folderId) formData.append("folderId", options.folderId);

    const response = await api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getFileById: async (fileId) => {
    const response = await api.get(`/files/${fileId}`);
    return response.data;
  },

  getUserFiles: async (userId) => {
    const response = await api.get(`/files/user/${userId}`);
    return response.data;
  },

  getFolderFiles: async (folderId) => {
    const response = await api.get(`/files/folder/${folderId}`);
    return response.data;
  },

  downloadFile: async (fileId) => {
    const response = await api.get(`/files/${fileId}/download`, {
      responseType: "blob",
    });
    return response;
  },

  deleteFile: async (fileId) => {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
  },

  updateFile: async (fileId, data) => {
    const response = await api.patch(`/files/${fileId}`, data);
    return response.data;
  },
};

// Folders API
export const foldersAPI = {
  createFolder: async (folderData) => {
    const response = await api.post("/folders", {
      name: folderData.name,
      parent: folderData.parentId || null,
      children: [],
      files: [],
    });
    return response.data;
  },

  getAllFolders: async () => {
    const response = await api.get("/folders");
    return response.data;
  },

  getUserFolders: async (userId) => {
    const response = await api.get(`/folders/user/${userId}`);
    return response.data;
  },

  getUserRootFolders: async (userId) => {
    const response = await api.get(`/folders/user/${userId}/root`);
    return response.data;
  },

  getUserFoldersWithCount: async (userId) => {
    const response = await api.get(`/folders/user/${userId}/with-count`);
    return response.data;
  },

  getUserRootFoldersWithCount: async (userId) => {
    const response = await api.get(`/folders/user/${userId}/root-with-count`);
    return response.data;
  },

  getFolderById: async (folderId) => {
    const response = await api.get(`/folders/${folderId}`);
    return response.data;
  },

  getChildrenFolders: async (folderId) => {
    const response = await api.get(`/folders/${folderId}/children`);
    return response.data;
  },

  getChildrenFoldersWithCount: async (folderId) => {
    const response = await api.get(`/folders/${folderId}/children-with-count`);
    return response.data;
  },

  updateFolder: async (folderId, data) => {
    const response = await api.patch(`/folders/${folderId}`, data);
    return response.data;
  },

  deleteFolder: async (folderId) => {
    const response = await api.delete(`/folders/${folderId}`);
    return response.data;
  },
};

export const usersAPI = {
  getAllUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },
  updateUser: async (userId, data) => {
    const response = await api.patch(`/users/${userId}`, data);
    return response.data;
  },
};

export default api;
