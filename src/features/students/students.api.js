// src/features/students/students.api.js
import api from '../../api/client'

// Get paginated students
export const fetchStudents = async ({ page = 1, search = '' } = {}) => {
  const params = {};
  if (page) params.page = page;
  if (search) params.search = search;
  const res = await api.get('/students/', { params });
  return res.data;
};

// Create a new student
export const createStudent = async (payload) => {
  const res = await api.post('/students/', payload);
  return res.data;
};

// Update an existing student (PATCH)
export const updateStudent = async (id, payload) => {
  const res = await api.patch(`/students/${id}/`, payload);
  return res.data;
};

// Delete a student
export const deleteStudent = async (id) => {
  const res = await api.delete(`/students/${id}/`);
  return res.data;
};
