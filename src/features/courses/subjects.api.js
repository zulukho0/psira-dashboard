import api from '../../api/client.js';

export const fetchSubjectsByCourse = async ({ course, page = 1 }) => {
  const params = { page, course };
  const res = await api.get('/subjects/', { params });
  return res.data;
}