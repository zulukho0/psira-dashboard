import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import Navbar from '../../../components/Navbar.jsx'
import {
  fetchInstructors,
  createInstructor,
  updateInstructor,
  deleteInstructor
} from '../instructors.api.js'
import InstructorModal from '../components/InstructorModal.jsx'

export default function InstructorsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInstructor, setEditingInstructor] = useState(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    psira_number: '',
    contact_number: '',
    signature: null
  })

  // Fetch instructors
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['instructors', page, search],
    queryFn: () => fetchInstructors({ page, search }),
    retry: 0,
    refetchOnWindowFocus: false
  })

  const instructors = data?.results || []
  const hasNextPage = data?.next
  const hasPreviousPage = data?.previous

  // Handlers
  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    refetch()
  }

  const handleRefresh = () => refetch()

  const openModal = (instructor = null) => {
    if (instructor) {
      setEditingInstructor(instructor)
      setFormData({
        first_name: instructor.first_name,
        last_name: instructor.last_name,
        psira_number: instructor.psira_number,
        contact_number: instructor.contact_number,
        signature: null
      })
    } else {
      setEditingInstructor(null)
      setFormData({
        first_name: '',
        last_name: '',
        psira_number: '',
        contact_number: '',
        signature: null
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => setIsModalOpen(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingInstructor) {
        await updateInstructor(editingInstructor.id, formData)
      } else {
        await createInstructor(formData)
      }
      refetch()
      closeModal()
    } catch (err) {
      console.error('Error saving instructor:', err)
    }
  }

  const handleDelete = async (id, firstName, lastName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${firstName} ${lastName}?`)
    if (!confirmDelete) return

    try {
      await deleteInstructor(id)
      refetch()
    } catch (err) {
      console.error('Error deleting instructor:', err)
    }
  }

  if (isLoading && !data) return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <div className="animate-pulse text-lg font-medium">Loading instructors...</div>
      </div>
    </>
  )

  if (error) return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-3">
        <h2 className="text-2xl font-semibold text-red-600">Error Loading Instructors</h2>
        <p className="text-gray-500">Status: {error.response?.status || 'Unknown'}</p>
        <p className="text-gray-500">Message: {error.message}</p>
        <button
          onClick={handleRefresh}
          className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
        >
          Try Again
        </button>
      </div>
    </>
  )

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Instructors</h1>
          <div className="flex gap-2">
            <button
              onClick={() => openModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
            >
              Add Instructor
            </button>
            <button
              onClick={handleRefresh}
              className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-md"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row items-center gap-2"
        >
          <input
            type="text"
            placeholder="Search instructors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Search
            </button>
            {(search || page > 1) && (
              <button
                type="button"
                onClick={() => { setSearch(''); setPage(1) }}
                className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-md"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Refresh Indicator */}
        {isFetching && <div className="text-sm text-gray-500 italic">Refreshing data...</div>}

        {/* Instructors Table */}
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Name</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">PSIRA Number</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Contact</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {instructors.length > 0 ? (
                instructors.map(instr => (
                  <tr key={instr.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{instr.first_name} {instr.last_name}</td>
                    <td className="px-4 py-2">{instr.psira_number}</td>
                    <td className="px-4 py-2">{instr.contact_number}</td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button
                        className="text-blue-600 hover:underline text-sm"
                        onClick={() => openModal(instr)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:underline text-sm"
                        onClick={() => handleDelete(instr.id, instr.first_name, instr.last_name)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    No instructors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {(data?.count > 0) && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-gray-600 text-sm">
              Showing {instructors.length} of {data?.count || 0} instructors
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

        {/* Instructor Modal */}
        <InstructorModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          formData={formData}
          handleChange={handleChange}
        />
      </div>
    </>
  )
}
