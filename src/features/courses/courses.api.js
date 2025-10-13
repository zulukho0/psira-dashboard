import api from '../../api/client.js';

// Fetch courses (with optional pagination and search)
export const fetchCourses = async ({ page = 1, search = '' } = {}) => {
  const params = {};
  if (page) params.page = page;
  if (search) params.search = search;
  const res = await api.get('/courses/', { params });
  return res.data;
};

// CRUD operations
export const createCourse = async (payload) => (await api.post('/courses/', payload)).data;
export const updateCourse = async (id, payload) => (await api.patch(`/courses/${id}/`, payload)).data;
export const deleteCourse = async (id) => (await api.delete(`/courses/${id}/`)).data;
