import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../../api/client.js';
import Navbar from '../../components/Navbar.jsx';
import { fetchStudents, createStudent, updateStudent } from '../students/students.api.js';

export default function StudentsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debugInfo, setDebugInfo] = useState({})
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newStudent, setNewStudent] = useState({
    first_name: '',
    last_name: '',
    id_number: '',
    contact_number: ''
  })
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)

  // Fetch students
  const fetchStudentsWrapper = async () => {
    try {
      const data = await fetchStudents({ page, search })
      setDebugInfo({ page, search, resultsCount: data.results.length })
      return data
    } catch (error) {
      setDebugInfo({
        ...debugInfo,
        error: {
          message: error.message,
          data: error.response?.data
        }
      })
      throw error
    }
  }

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['students', page, search],
    queryFn: fetchStudentsWrapper,
    retry: 0,
    refetchOnWindowFocus: false
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    refetch()
  }

  const handleRefresh = () => refetch()

  const students = data?.results || []
  const hasNextPage = !!data?.next
  const hasPreviousPage = !!data?.previous

  // Create student
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    try {
      await createStudent(newStudent)
      setIsCreateOpen(false)
      setNewStudent({ first_name: '', last_name: '', id_number: '', contact_number: '' })
      refetch()
    } catch (err) {
      console.error('Error creating student:', err)
    }
  }

  // Update student
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateStudent(editingStudent.id, editingStudent)
      setIsEditOpen(false)
      setEditingStudent(null)
      refetch()
    } catch (err) {
      console.error('Error updating student:', err)
    }
  }

  if (isLoading && !data) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
          <div className="animate-pulse text-lg font-medium">Loading students...</div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-3">
          <h2 className="text-2xl font-semibold text-red-600">Error Loading Students</h2>
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
  }

  return (
    <>
      <Navbar />

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Students</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
            >
              Add Student
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
            placeholder="Search students..."
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
        {isFetching && (
          <div className="text-sm text-gray-500 italic">Refreshing data...</div>
        )}

        {/* Table */}
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Name</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">ID Number</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Contact</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map(student => (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{student.first_name} {student.last_name}</td>
                    <td className="px-4 py-2">{student.id_number}</td>
                    <td className="px-4 py-2">{student.contact_number}</td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button
                        className="text-blue-600 hover:underline text-sm"
                        onClick={() => { setEditingStudent(student); setIsEditOpen(true) }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    No students found
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
              Showing {students.length} of {data?.count || 0} students
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

        {/* Create Student Modal */}
        {isCreateOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Add Student</h2>
              <form onSubmit={handleCreateSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="First Name"
                  value={newStudent.first_name}
                  onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={newStudent.last_name}
                  onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                  required
                />
                <input
                  type="text"
                  placeholder="ID Number"
                  value={newStudent.id_number}
                  onChange={(e) => setNewStudent({ ...newStudent, id_number: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                  required
                />
                <input
                  type="text"
                  placeholder="Contact Number"
                  value={newStudent.contact_number}
                  onChange={(e) => setNewStudent({ ...newStudent, contact_number: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                  required
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Student Modal */}
        {isEditOpen && editingStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Edit Student</h2>
              <form onSubmit={handleEditSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="First Name"
                  value={editingStudent.first_name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, first_name: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={editingStudent.last_name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, last_name: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                  required
                />
                <input
                  type="text"
                  placeholder="ID Number"
                  value={editingStudent.id_number}
                  onChange={(e) => setEditingStudent({ ...editingStudent, id_number: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                  required
                />
                <input
                  type="text"
                  placeholder="Contact Number"
                  value={editingStudent.contact_number}
                  onChange={(e) => setEditingStudent({ ...editingStudent, contact_number: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                  required
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => { setIsEditOpen(false); setEditingStudent(null) }}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Debug Info */}
        <details className="mt-6 bg-gray-50 rounded-md p-3 text-sm text-gray-600">
          <summary className="cursor-pointer font-semibold">Debug Information</summary>
          <pre className="overflow-x-auto mt-2">{JSON.stringify(debugInfo, null, 2)}</pre>
        </details>
      </div>
    </>
  )
}