// src/features/results/results.api.js
import api from '../../api/client.js';

export const listResultsForClass = async ({ classId, page = 1 }) => {
  const params = { page, class: classId };
  const res = await api.get('/results/', { params });
  return res.data;
};

export const upsertResult = async ({ id, student, classId, subject, score, grade, comments }) => {
  const payload = {
    student,
    class: classId,
    subject,  
    score,
    grade,
    comments,
  };
  if (id) {
    const res = await api.patch(`/results/${id}/`, payload);
    return res.data;
  } else {
    const res = await api.post('/results/', payload);
    return res.data;
  }
};