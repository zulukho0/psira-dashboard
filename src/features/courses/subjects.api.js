// src/features/courses/subjects.api.js
import api from '../../api/client.js';

export const fetchSubjects = async ({ page = 1, search = '' } = {}) => {
  const params = {};
  if (page) params.page = page;

  if (search) {
    if (search.startsWith('course:')) {
      params.course = search.split(':')[1];
    } else if (search.startsWith('course_id:')) {
      params.course = search.split(':')[1];
    } else {
      params.search = search;
    }
  }

  const res = await api.get('/subjects/', { params });
  return res.data;
};

export const createSubject = async (payload) => (await api.post('/subjects/', payload)).data;
export const updateSubject = async (id, payload) => (await api.patch(`/subjects/${id}/`, payload)).data;
export const deleteSubject = async (id) => (await api.delete(`/subjects/${id}/`)).data;