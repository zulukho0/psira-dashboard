import { useEffect, useState } from 'react';
import { fetchCourses } from '../../courses/courses.api.js';
import { fetchInstructors } from '../../instructors/instructors.api.js';

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
        console.error('Error fetching courses:', err);
      } finally {
        setLoadingCourses(false);
      }
    };

    const loadInstructors = async () => {
      try {
        const data = await fetchInstructors({ page: 1, search: '' });
        setInstructors(data.results || []);
      } catch (err) {
        console.error('Error fetching instructors:', err);
      } finally {
        setLoadingInstructors(false);
      }
    };

    loadCourses();
    loadInstructors();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-start pt-20 z-50 overflow-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {isEdit ? 'Edit Class' : 'Add Class'}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Course */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Course</label>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">Select a course</option>
              {loadingCourses
                ? null
                : courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.grade} — {c.description}
                    </option>
                  ))}
            </select>
          </div>

          {/* Course Number */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Course Number</label>
            <input
              type="text"
              name="course_number"
              value={formData.course_number}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Batch Number */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Batch Number</label>
            <input
              type="text"
              name="batch_number"
              value={formData.batch_number}
              disabled
              className="border border-gray-300 rounded-md px-3 py-2 w-full bg-gray-100 text-gray-500"
            />
          </div>

          {/* Dates */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Instructor */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Instructor</label>
            <select
              name="instructor"
              value={formData.instructor}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">Select an instructor</option>
              {loadingInstructors
                ? null
                : instructors.map((ins) => (
                    <option key={ins.id} value={ins.id}>
                      {ins.first_name} {ins.last_name} — {ins.psira_number}
                    </option>
                  ))}
            </select>
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
