import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Navbar from '../../components/Navbar.jsx';
import { fetchInstructors, createInstructor, updateInstructor, deleteInstructor } from '../instructors/instructors.api.js';
import InstructorModal from '../components/InstructorModal.jsx';

export default function InstructorsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', contact_number: '' });

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['instructors', page, search],
    queryFn: () => fetchInstructors({ page, search }),
    retry: 0,
    refetchOnWindowFocus: false
  });

  const instructors = data?.results || [];
  const hasNextPage = !!data?.next;
  const hasPreviousPage = !!data?.previous;

  // Handlers
  const handleSearch = (e) => { e.preventDefault(); setPage(1); refetch(); };
  const openModal = (instructor = null) => {
    if (instructor) {
      setEditingInstructor(instructor);
      setFormData({ ...instructor });
    } else {
      setEditingInstructor(null);
      setFormData({ first_name: '', last_name: '', email: '', contact_number: '' });
    }
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInstructor) await updateInstructor(editingInstructor.id, formData);
      else await createInstructor(formData);
      refetch();
      closeModal();
    } catch (err) { console.error(err); }
  };
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete instructor ${name}?`)) return;
    try { await deleteInstructor(id); refetch(); } catch (err) { console.error(err); }
  };

  if (isLoading) return <><Navbar /><div className="flex justify-center items-center min-h-screen">Loading instructors...</div></>;
  if (error) return <><Navbar /><div>Error loading instructors</div></>;

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Instructors</h1>
          <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Add Instructor</button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input type="text" placeholder="Search instructors..." value={search} onChange={e => setSearch(e.target.value)} className="border border-gray-300 px-3 py-2 rounded-md" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Search</button>
        </form>

        {isFetching && <div className="text-sm text-gray-500 italic mb-2">Refreshing data...</div>}

        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Contact</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {instructors.length > 0 ? instructors.map(i => (
                <tr key={i.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{i.first_name} {i.last_name}</td>
                  <td className="px-4 py-2">{i.email}</td>
                  <td className="px-4 py-2">{i.contact_number}</td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <button className="text-blue-600 hover:underline text-sm" onClick={() => openModal(i)}>Edit</button>
                    <button className="text-red-600 hover:underline text-sm" onClick={() => handleDelete(i.id, i.first_name)}>Delete</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="text-center py-6 text-gray-500">No instructors found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.count > 0 && (
          <div className="flex justify-between items-center mt-4">
            <button onClick={() => setPage(page - 1)} disabled={!hasPreviousPage || page <= 1} className="border border-gray-300 px-3 py-1.5 rounded-md disabled:opacity-50">Previous</button>
            <span>Page {page}</span>
            <button onClick={() => setPage(page + 1)} disabled={!hasNextPage} className="border border-gray-300 px-3 py-1.5 rounded-md disabled:opacity-50">Next</button>
          </div>
        )}

        <InstructorModal isOpen={isModalOpen} onClose={closeModal} onSubmit={handleSubmit} formData={formData} onChange={handleChange} isEdit={!!editingInstructor} />
      </div>
    </>
  );
}
