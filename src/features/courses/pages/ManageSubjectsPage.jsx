import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar.jsx';
import { fetchCourses } from '../../courses/courses.api.js';
import { fetchSubjects, createSubject, updateSubject, deleteSubject } from '../subjects.api.js';

export default function ManageSubjectsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: '', max_theory: 100, max_practical: 100 });
  const [editingSubject, setEditingSubject] = useState(null);

  // Fetch course details
  const { data: course, isLoading: courseLoading, error: courseError } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => fetchCourses({ search: `id:${courseId}` }),
    enabled: !!courseId
  });

  // Fetch subjects for this course
  const { data: subjectsData, isLoading: subjectsLoading, error: subjectsError, refetch } = useQuery({
    queryKey: ['subjects', courseId],
    queryFn: () => fetchSubjects({ search: `course_id:${courseId}` }),
    enabled: !!courseId
  });

  const subjects = subjectsData?.results || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const subjectData = {
        ...formData,
        course: courseId
      };

      if (editingSubject) {
        await updateSubject(editingSubject.id, subjectData);
      } else {
        await createSubject(subjectData);
      }

      // Reset form
      setFormData({ name: '', max_theory: 100, max_practical: 100 });
      setEditingSubject(null);
      
      // Refresh subjects list
      refetch();
      queryClient.invalidateQueries(['subjects', courseId]);
    } catch (err) {
      console.error('Error saving subject:', err);
    }
  };

  const handleEdit = (subject) => {
    setFormData({
      name: subject.name,
      max_theory: subject.max_theory,
      max_practical: subject.max_practical
    });
    setEditingSubject(subject);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this subject?');
    if (!confirmDelete) return;

    try {
      await deleteSubject(id);
      refetch();
      queryClient.invalidateQueries(['subjects', courseId]);
    } catch (err) {
      console.error('Error deleting subject:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (courseLoading || subjectsLoading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          Loading course and subjects...
        </div>
      </>
    );
  }

  if (courseError || subjectsError) {
    return (
      <>
        <Navbar />
        <div className="p-6 max-w-3xl mx-auto text-red-600">
          Error loading course or subjects
        </div>
      </>
    );
  }

  const courseData = course?.results?.[0] || {};

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            Manage Subjects for {courseData.grade || 'Course'}
          </h1>
          <button
            onClick={() => navigate('/courses')}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Back to Courses
          </button>
        </div>

        {/* Add/Edit Subject Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {editingSubject ? 'Edit Subject' : 'Add New Subject'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              name="name"
              placeholder="Subject Name"
              value={formData.name}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2"
              required
            />
            <input
              name="max_theory"
              placeholder="Max Theory Marks"
              type="number"
              value={formData.max_theory}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2"
              required
            />
            <input
              name="max_practical"
              placeholder="Max Practical Marks"
              type="number"
              value={formData.max_practical}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {editingSubject ? 'Update' : 'Add'}
              </button>
              {editingSubject && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingSubject(null);
                    setFormData({ name: '', max_theory: 100, max_practical: 100 });
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Subjects List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Subjects</h2>
          {subjects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border px-4 py-2 text-left">Name</th>
                    <th className="border px-4 py-2 text-left">Max Theory</th>
                    <th className="border px-4 py-2 text-left">Max Practical</th>
                    <th className="border px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject.id} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{subject.name}</td>
                      <td className="border px-4 py-2">{subject.max_theory}</td>
                      <td className="border px-4 py-2">{subject.max_practical}</td>
                      <td className="border px-4 py-2 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(subject.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No subjects found for this course</p>
          )}
        </div>
      </div>
    </>
  );
}