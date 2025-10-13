import { useEffect, useState } from 'react';
import { fetchCourses } from '../../courses/courses.api.js';

export default function ClassModal({ isOpen, onClose, onSubmit, formData, handleChange, isEdit }) {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingInstructors, setLoadingInstructors] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await fetchCourses({ page: 1, search: '' });
        setCourses(data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCourses(false);
      }
    };

    const loadInstructors = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/instructors/');
        const data = await res.json();
        setInstructors(data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingInstructors(false);
      }
    };

    loadCourses();
    loadInstructors();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <h2 className="text-xl font-semibold mb-4">{isEdit ? 'Edit Class' : 'Add Class'}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Course */}
          <div>
            <label className="block text-sm font-medium">Course</label>
            {loadingCourses ? (
              <p>Loading courses...</p>
            ) : (
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="border border-gray-300 w-full px-3 py-2 rounded-md"
                required
              >
                <option value="">Select a course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.grade} — {c.description}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Course Number */}
          <div>
            <label className="block text-sm font-medium">Course Number</label>
            <input
              type="text"
              name="course_number"
              value={formData.course_number}
              onChange={handleChange}
              className="border border-gray-300 w-full px-3 py-2 rounded-md"
              required
            />
          </div>

          {/* Batch Number */}
          <div>
            <label className="block text-sm font-medium">Batch Number</label>
            <input
              type="text"
              name="batch_number"
              value={formData.batch_number}
              className="border border-gray-300 w-full px-3 py-2 rounded-md bg-gray-100 text-gray-500"
              disabled
            />
          </div>

          {/* Dates */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
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
                onChange={handleChange}
                className="border border-gray-300 w-full px-3 py-2 rounded-md"
                required
              />
            </div>
          </div>

          {/* Instructor */}
          <div>
            <label className="block text-sm font-medium">Instructor</label>
            {loadingInstructors ? (
              <p>Loading instructors...</p>
            ) : (
              <select
                name="instructor"
                value={formData.instructor}
                onChange={handleChange}
                className="border border-gray-300 w-full px-3 py-2 rounded-md"
                required
              >
                <option value="">Select an instructor</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.first_name} {i.last_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Buttons */}
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
