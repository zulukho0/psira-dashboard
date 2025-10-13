import api from '../../api/client.js';

export const fetchClasses = async ({ page, search }) => {
  const params = new URLSearchParams();
  if (page) params.append('page', page);
  if (search) params.append('search', search);
  const response = await api.get(`/classes/?${params.toString()}`);
  return response.data;
};

export const createClass = async (data) => {
  const response = await api.post('/classes/', data);
  return response.data;
};

export const updateClass = async (id, data) => {
  const response = await api.put(`/classes/${id}/`, data);
  return response.data;
};

export const deleteClass = async (id) => {
  const response = await api.delete(`/classes/${id}/`);
  return response.data;
};
