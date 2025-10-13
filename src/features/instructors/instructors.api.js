import api from '../../api/client.js';

// Fetch all instructors
export const fetchInstructors = async ({ page = 1, search = '' } = {}) => {
  const params = {};
  if (page) params.page = page;
  if (search) params.search = search;
  const res = await api.get('/instructors/', { params });
  return res.data;
};

// Create new instructor
export const createInstructor = async (payload) => {
  const formData = new FormData();
  for (const key in payload) {
    formData.append(key, payload[key]);
  }
  const res = await api.post('/instructors/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// Update instructor
export const updateInstructor = async (id, payload) => {
  const formData = new FormData();
  for (const key in payload) {
    formData.append(key, payload[key]);
  }
  const res = await api.patch(`/instructors/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// Delete instructor
export const deleteInstructor = async (id) => {
  const res = await api.delete(`/instructors/${id}/`);
  return res.data;
};
