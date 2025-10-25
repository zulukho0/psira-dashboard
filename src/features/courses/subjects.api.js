import api from '../../api/client.js';

export const fetchSubjectsByCourse = async ({ course, page = 1 }) => {
  const params = { page, course };
  const res = await api.get('/subjects/', { params });
  return res.data;
}

// GET /subject-results/?result__class_instance=<classId>[&result=<resultId>]
export const listSubjectResultsForClass = async ({ classId, resultId, page = 1 }) => {
  const params = { page, 'result__class_instance': classId };
  if (resultId) params.result = resultId;
  const res = await api.get('/subject-results/', { params });
  return res.data;
};

// PATCH /subject-results/:id/
export const patchSubjectResult = async (id, payload) => {
  const res = await api.patch(`/subject-results/${id}/`, payload);
  return res.data;
};