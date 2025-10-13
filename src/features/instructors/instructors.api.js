import api from '../../api/client.js';

export const fetchInstructors = async ({ page = 1, search = '' } = {}) => {
  const params = {};
  if (page) params.page = page;
  if (search) params.search = search;
  const res = await api.get('/instructors/', { params });
  return res.data;
};

export const createInstructor = async (payload) => (await api.post('/instructors/', payload)).data;
export const updateInstructor = async (id, payload) => (await api.patch(`/instructors/${id}/`, payload)).data;
export const deleteInstructor = async (id) => (await api.delete(`/instructors/${id}/`)).data;
