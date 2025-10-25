import api from '../../api/client.js';

// List all Results for a class
export const listResultsForClass = async ({ classId, page = 1 }) => {
  const params = { page, class_instance: classId };
  const res = await api.get('/results/', { params });
  return res.data;
};

// Get or create a Result for a student in a class
export const getOrCreateResultForStudentClass = async ({ student, class_instance }) => {
  // Assuming your backend supports POST /results/get_or_create/ with student and class_instance
  const res = await api.post('/results/get_or_create/', { student, class_instance });
  return res.data;
};

// List SubjectResults for a class (optionally filtered by result)
export const listSubjectResultsForClass = async ({ classId, resultId, page = 1 }) => {
  const params = { page, 'result__class_instance': classId };
  if (resultId) params.result = resultId;
  const res = await api.get('/subject-results/', { params });
  return res.data;
};

// Patch a SubjectResult by id
export const patchSubjectResult = async (id, payload) => {
  const res = await api.patch(`/subject-results/${id}/`, payload);
  return res.data;
};