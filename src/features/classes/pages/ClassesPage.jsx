import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../../../components/Navbar.jsx';
import { fetchClasses, createClass, updateClass, deleteClass } from '../classes.api.js';
import ClassModal from '../components/ClassModal.jsx';

export default function ClassesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    course_number: '',
    batch_number: '',
    start_date: '',
    end_date: '',
    course: '',
    instructor: ''
  });

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['classes', page, search],
    queryFn: () => fetchClasses({ page, search }),
    retry: 0,
    refetchOnWindowFocus: false
  });

  const classes = data?.results || [];
  const hasNextPage = !!data?.next;
  const hasPreviousPage = !!data?.previous;

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  const openModal = (classItem = null) => {
    if (classItem) {
      setEditingClass(classItem);
      setFormData({
        course_number: classItem.course_number,
        batch_number: classItem.batch_number,
        start_date: classItem.start_date,
        end_date: classItem.end_date,
        course: classItem.course,
        instructor: classItem.instructor
      });
    } else {
      setEditingClass(null);
      setFormData({
        course_number: '',
        batch_number: '',
        start_date: '',
        end_date: '',
        course: '',
        instructor: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await updateClass(editingClass.id, formData);
      } else {
        await createClass(formData);
      }
      refetch();
      closeModal();
    } catch (err) {
      console.error('Error saving class:', err);
    }
  };

  const handleDelete = async (id, batch_number) => {
    const confirmDelete = window.confirm(`Delete batch ${batch_number}?`);
    if (!confirmDelete) return;

    try {
      await deleteClass(id);
      refetch();
    } catch (err) {
      console.error('Error deleting class:', err);
    }
  };

  if (isLoading)
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">Loading classes...</div>
      </>
    );

  if (error)
    return (
      <>
        <Navbar />
        <div>Error loading classes</div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Classes</h1>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Class
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Search
          </button>
        </form>

        {isFetching && (
          <div className="text-sm text-gray-500 italic mb-2">Refreshing data...</div>
        )}

        {/* Table */}
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left">Course Number</th>
                <th className="px-4 py-2 text-left">Batch Number</th>
                <th className="px-4 py-2 text-left">Start Date</th>
                <th className="px-4 py-2 text-left">End Date</th>
                <th className="px-4 py-2 text-left">Course</th>
                <th className="px-4 py-2 text-left">Instructor</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.length > 0 ? (
                classes.map((cls) => (
                  <tr key={cls.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{cls.course_number}</td>
                    <td className="px-4 py-2">{cls.batch_number}</td>
                    <td className="px-4 py-2">{cls.start_date}</td>
                    <td className="px-4 py-2">{cls.end_date}</td>
                    <td className="px-4 py-2">{cls.course}</td>
                    <td className="px-4 py-2">{cls.instructor}</td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button
                        className="text-blue-600 hover:underline text-sm"
                        onClick={() => openModal(cls)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:underline text-sm"
                        onClick={() => handleDelete(cls.id, cls.batch_number)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">
                    No classes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.count > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
            <p className="text-gray-600 text-sm">
              Showing {classes.length} of {data?.count || 0} classes
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
        <ClassModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          formData={formData}
          handleChange={handleChange}
          isEdit={!!editingClass}
        />
      </div>
    </>
  );
}
