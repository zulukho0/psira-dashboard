import api from '../api/client';

export const getStudents = async ({ page = 1, search = '' } = {}) => {
  const params = {};
  if (page) params.page = page;
  if (search) params.search = search; // if backend supports ?search=
  const res = await api.get('/students/', { params });
  return res.data;
};

export const createStudent = async (payload) => (await api.post('/students/', payload)).data;
export const updateStudent = async (id, payload) => (await api.patch(`/students/${id}/`, payload)).data;
export const deleteStudent = async (id) => (await api.delete(`/students/${id}/`)).data;