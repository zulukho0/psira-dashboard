import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Navbar from '../../../components/Navbar.jsx';
import { fetchCourses, createCourse, updateCourse, deleteCourse } from '../courses.api.js';
import CourseModal from '../components/CourseModal.jsx';

export default function CoursesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({ grade: '', description: '', price: '' });

  // Fetch courses
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['courses', page, search],
    queryFn: () => fetchCourses({ page, search }),
    retry: 0,
    refetchOnWindowFocus: false
  });

  const courses = data?.results || [];
  const hasNextPage = !!data?.next;
  const hasPreviousPage = !!data?.previous;

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  // Modal handlers
  const openModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        grade: course.grade,
        description: course.description,
        price: course.price
      });
    } else {
      setEditingCourse(null);
      setFormData({ grade: '', description: '', price: '' });
    }
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, formData);
      } else {
        await createCourse(formData);
      }
      refetch();
      closeModal();
    } catch (err) {
      console.error('Error saving course:', err);
    }
  };

  const handleDelete = async (id, grade) => {
    const confirmDelete = window.confirm(`Delete course ${grade}?`);
    if (!confirmDelete) return;

    try {
      await deleteCourse(id);
      refetch();
    } catch (err) {
      console.error('Error deleting course:', err);
    }
  };

  if (isLoading) return <><Navbar /><div className="flex justify-center items-center min-h-screen">Loading courses...</div></>;

  if (error) return <><Navbar /><div>Error loading courses</div></>;

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Courses</h1>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Course
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Search</button>
        </form>

        {/* Refresh Indicator */}
        {isFetching && <div className="text-sm text-gray-500 italic mb-2">Refreshing data...</div>}

        {/* Table */}
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left">Grade</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length > 0 ? courses.map(course => (
                <tr key={course.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{course.grade}</td>
                  <td className="px-4 py-2">{course.description}</td>
                  <td className="px-4 py-2">{course.price}</td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <button className="text-blue-600 hover:underline text-sm" onClick={() => openModal(course)}>Edit</button>
                    <button className="text-red-600 hover:underline text-sm" onClick={() => handleDelete(course.id, course.grade)}>Delete</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">No courses found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.count > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
            <p className="text-gray-600 text-sm">
              Showing {courses.length} of {data?.count || 0} courses
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!hasPreviousPage || page <= 1}
                className="border border-gray-300 hover:bg-gray-100 px-3 py-1.5 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">Page {page}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!hasNextPage}
                className="border border-gray-300 hover:bg-gray-100 px-3 py-1.5 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Modal */}
        <CourseModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          formData={formData}
          onChange={handleChange}
          isEdit={!!editingCourse}
        />
      </div>
    </>
  );
}
