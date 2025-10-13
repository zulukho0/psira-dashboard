import api from '../../api/client.js';

// Classes CRUD
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

// Update students in a class
export const updateClassStudents = async (classId, studentIds) => {
  const token = localStorage.getItem('access_token');
  const res = await fetch(
    `http://localhost:8000/api/classes/${classId}/update_students/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ students: studentIds }),
    }
  );

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.detail || 'Failed to update students');
  }

  return res.json();
};
