import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import Navbar from '../../components/Navbar.jsx'
import { fetchStudents, createStudent, updateStudent, deleteStudent } from '../students/students.api.js'

export default function StudentsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debugInfo, setDebugInfo] = useState({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [formData, setFormData] = useState({
    first_name: '',
    second_name: '',
    last_name: '',
    id_number: '',
    contact_number: ''
  })

  // Fetch students
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['students', page, search],
    queryFn: async () => {
      try {
        const data = await fetchStudents({ page, search })
        setDebugInfo({ page, search })
        return data
      } catch (err) {
        setDebugInfo({ error: err.message })
        throw err
      }
    },
    retry: 0,
    refetchOnWindowFocus: false,
  })

  const students = data?.results || []
  const hasNextPage = data?.next
  const hasPreviousPage = data?.previous

  const handleSearch = (e) => { e.preventDefault(); setPage(1); refetch() }
  const handleRefresh = () => refetch()

  const openModal = (student = null) => {
    if (student) {
      setEditingStudent(student)
      setFormData({
        first_name: student.first_name,
        second_name: student.second_name || '',
        last_name: student.last_name,
        id_number: student.id_number,
        contact_number: student.contact_number
      })
    } else {
      setEditingStudent(null)
      setFormData({ first_name: '', second_name: '', last_name: '', id_number: '', contact_number: '' })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => setIsModalOpen(false)
  const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, formData)
      } else {
        await createStudent(formData)
      }
      refetch()
      closeModal()
    } catch (err) {
      console.error('Error saving student:', err)
    }
  }

  const handleDelete = async (id, firstName, lastName) => {
    if (!window.confirm(`Are you sure you want to delete ${firstName} ${lastName}?`)) return
    try { await deleteStudent(id); refetch() } catch (err) { console.error(err) }
  }

  if (isLoading && !data) return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <div className="animate-pulse text-lg font-medium">Loading students...</div>
      </div>
    </>
  )

  if (error) return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-3">
        <h2 className="text-2xl font-semibold text-red-600">Error Loading Students</h2>
        <p className="text-gray-500">Message: {error.message}</p>
        <button onClick={handleRefresh} className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow">Try Again</button>
      </div>
    </>
  )

  return (
    <>
      <Navbar />

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Students</h1>
          <div className="flex gap-2">
            <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow">Add Student</button>
            <button onClick={handleRefresh} className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-md">Refresh</button>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2">
          <input type="text" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Search</button>
            {(search || page > 1) && <button type="button" onClick={() => { setSearch(''); setPage(1) }} className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-md">Clear</button>}
          </div>
        </form>

        {/* Refresh Indicator */}
        {isFetching && <div className="text-sm text-gray-500 italic">Refreshing data...</div>}

        {/* Students Table */}
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">First Name</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Second Name</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Last Name</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">ID Number</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Contact</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? students.map(student => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{student.first_name}</td>
                  <td className="px-4 py-2">{student.second_name || ''}</td>
                  <td className="px-4 py-2">{student.last_name}</td>
                  <td className="px-4 py-2">{student.id_number}</td>
                  <td className="px-4 py-2">{student.contact_number}</td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <button className="text-blue-600 hover:underline text-sm" onClick={() => openModal(student)}>Edit</button>
                    <button className="text-red-600 hover:underline text-sm" onClick={() => handleDelete(student.id, student.first_name, student.last_name)}>Delete</button>
                  </td>
                </tr>
              )) : <tr><td colSpan="6" className="text-center py-6 text-gray-500">No students found</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.count > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-gray-600 text-sm">Showing {students.length} of {data?.count || 0} students</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(page - 1)} disabled={!hasPreviousPage || page <= 1} className="border border-gray-300 hover:bg-gray-100 px-3 py-1.5 rounded-md disabled:opacity-50">Previous</button>
              <span className="text-sm text-gray-700">Page {page}</span>
              <button onClick={() => setPage(page + 1)} disabled={!hasNextPage} className="border border-gray-300 hover:bg-gray-100 px-3 py-1.5 rounded-md disabled:opacity-50">Next</button>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editingStudent ? 'Edit Student' : 'Add Student'}</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 w-full" required />
                <input name="second_name" placeholder="Second Name" value={formData.second_name} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 w-full" />
                <input name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 w-full" required />
                <input name="id_number" placeholder="ID Number" value={formData.id_number} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 w-full" required />
                <input name="contact_number" placeholder="Contact Number" value={formData.contact_number} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 w-full" required />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={closeModal} className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100">Cancel</button>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">{editingStudent ? 'Update' : 'Create'}</button>
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
