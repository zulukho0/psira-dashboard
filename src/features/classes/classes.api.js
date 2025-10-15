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
// classes.api.js
export const updateClassStudents = async (classId, studentIds) => {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`http://localhost:8000/api/classes/${classId}/update_students/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ students: studentIds }),
  });

  // Check for errors
  if (!res.ok) {
    // Try to parse JSON error if possible
    try {
      const errorData = await res.json();
      throw new Error(
        errorData.detail || 
        Object.entries(errorData)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(', ') ||
        'Failed to update students'
      );
    } catch {
      // fallback if not JSON (HTML, etc.)
      const text = await res.text();
      throw new Error(text || 'Failed to update students');
    }
  }

  // Return updated class data
  return res.json();
};

