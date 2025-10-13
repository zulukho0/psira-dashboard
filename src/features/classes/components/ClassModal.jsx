import { useEffect, useState } from 'react';
import { fetchCourses } from '../../courses/courses.api.js';

export default function ClassModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onChange,
  isEdit
}) {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await fetchCourses({ page: 1, search: '' });
        setCourses(data.results || []);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">
          {isEdit ? 'Edit Class' : 'Add Class'}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Course Number</label>
            <input
              type="text"
              name="course_number"
              value={formData.course_number}
              onChange={onChange}
              className="border border-gray-300 w-full px-3 py-2 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Batch Number</label>
            <input
              type="text"
              name="batch_number"
              value={formData.batch_number}
              onChange={onChange}
              className="border border-gray-300 w-full px-3 py-2 rounded-md"
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={onChange}
                className="border border-gray-300 w-full px-3 py-2 rounded-md"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={onChange}
                className="border border-gray-300 w-full px-3 py-2 rounded-md"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Course</label>
            {loadingCourses ? (
              <p className="text-gray-500 text-sm italic">Loading courses...</p>
            ) : error ? (
              <p className="text-red-500 text-sm">{error}</p>
            ) : (
              <select
                name="course"
                value={formData.course}
                onChange={onChange}
                className="border border-gray-300 w-full px-3 py-2 rounded-md"
                required
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.grade} — {course.description}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {isEdit ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
