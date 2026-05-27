import axios from 'axios';
import { AssignmentFormData, Assignment } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.errors?.[0]?.message ||
      err.response?.data?.message ||
      err.message ||
      'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const assignmentApi = {
  create: async (data: Omit<AssignmentFormData, 'file'>) => {
    const res = await api.post('/api/assignments', data);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`/api/assignments/${id}`);
    return res.data;
  },

  list: async (page = 1, limit = 10) => {
    const res = await api.get(`/api/assignments?page=${page}&limit=${limit}`);
    return res.data;
  },

  getStatus: async (id: string) => {
    const res = await api.get(`/api/assignments/${id}/status`);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/api/assignments/${id}`);
    return res.data;
  },
};

export default api;
