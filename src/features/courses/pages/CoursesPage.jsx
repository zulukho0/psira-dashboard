import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import Navbar from '../../../components/Navbar.jsx'
import { fetchCourses, createCourse } from '../courses.api.js';
import CourseModal from '../components/CourseModal.jsx';

export default function CoursesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ grade: '', description: '', price: '' });

  // Fetch courses
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
    retry: 0,
    refetchOnWindowFocus: false,
  });

  const courses = data?.results || [];

  // Form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Create course
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCourse(formData);
      setIsModalOpen(false);
      setFormData({ grade: '', description: '', price: '' });
      refetch();
    } catch (err) {
      console.error('Error creating course:', err);
    }
  };

  if (isLoading && !data) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
          <div className="animate-pulse text-lg font-medium">Loading courses...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-3">
          <h2 className="text-2xl font-semibold text-red-600">Error Loading Courses</h2>
          <p className="text-gray-500">Message: {error.message}</p>
          <button
            onClick={refetch}
            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
          >
            Try Again
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Courses</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
          >
            Add Course
          </button>
        </div>

        {/* Refresh Indicator */}
        {isFetching && <div className="text-sm text-gray-500 italic">Refreshing data...</div>}

        {/* Courses Table */}
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Grade</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Description</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Price</th>
              </tr>
            </thead>
            <tbody>
              {courses.length > 0 ? (
                courses.map((course) => (
                  <tr key={course.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{course.grade}</td>
                    <td className="px-4 py-2">{course.description}</td>
                    <td className="px-4 py-2">{course.price}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-gray-500">
                    No courses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Course Modal */}
        <CourseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          formData={formData}
          onChange={handleChange}
        />
      </div>
    </>
  );
}
