import Cookies from 'js-cookie';

const API_URL =
  process.env.REACT_APP_API_URL ||
  'https://images-storage-nestjs-production.up.railway.app';

const request = async (url, options = {}) => {
  const token = Cookies.get('jwt');
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${url}`, {
    credentials: 'include',
    ...options,
    headers,
  });
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error('API error');
  }
  return res.json();
};

export const login = (email, password) =>
  request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

export const register = (data) =>
  request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const getProfile = () => request('/auth/profile');

export const updateProfile = (data) =>
  request('/auth/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const fetchFolders = (userId) => request(`/folders/user/${userId}`);

export const fetchFolderFiles = (folderId) => request(`/folders/${folderId}/files`);

export const createFolder = (name, parentId) =>
  request('/folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, parentId }),
  });

export const deleteFolder = (folderId) =>
  request(`/folders/${folderId}`, { method: 'DELETE' });

export const deleteFile = (fileId) =>
  request(`/files/${fileId}`, { method: 'DELETE' });

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return request('/files/upload', {
    method: 'POST',
    body: formData,
  });
};
