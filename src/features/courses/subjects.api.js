import api from '../../api/client.js';

// Fetch subjects (with optional pagination and search)
export const fetchSubjects = async ({ page = 1, search = '' } = {}) => {
  const params = {};
  if (page) params.page = page;
  
  // Handle special search parameters like course:id
  if (search) {
    if (search.startsWith('course:')) {
      const courseId = search.split(':')[1];
      params.course = courseId;
    } else {
      params.search = search;
    }
  }
  
  const res = await api.get('/subjects/', { params });
  return res.data;
};

// CRUD operations for subjects
export const createSubject = async (payload) => (await api.post('/subjects/', payload)).data;
export const updateSubject = async (id, payload) => (await api.patch(`/subjects/${id}/`, payload)).data;
export const deleteSubject = async (id) => (await api.delete(`/subjects/${id}/`)).data;