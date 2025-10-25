import api from '../../api/client.js';

// GET /results/?class_instance=<id>
export const listResultsForClass = async ({ classId, page = 1 }) => {
  const params = { page, class_instance: classId };
  const res = await api.get('/results/', { params });
  return res.data;
};

// POST /results/ { student, class_instance } (creates Result and auto-creates SubjectResults via signal)
export const getOrCreateResultForStudentClass = async ({ student, class_instance }) => {
  try {
    const res = await api.post('/results/', { student, class_instance });
    return res.data;
  } catch (err) {
    // If already exists, fetch list and return existing
    if (err?.response?.status === 400 || err?.response?.status === 409) {
      const list = await listResultsForClass({ classId: class_instance });
      const items = list?.results || list || [];
      const existing = items.find((r) => r.student === student);
      if (existing) return existing;
    }
    throw err;
  }
};