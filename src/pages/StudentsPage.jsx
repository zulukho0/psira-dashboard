import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../api/client'

export default function StudentsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debugInfo, setDebugInfo] = useState({})

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
      const params = new URLSearchParams()
      if (page) params.append('page', page.toString())
      if (search) params.append('search', search)
      const url = `/students/${params.toString() ? '?' + params.toString() : ''}`

      const response = await api.get(url)
      setDebugInfo({ token: !!token, apiBase, url, responseStatus: response.status })
      return response.data
    } catch (error) {
      setDebugInfo({
        ...debugInfo,
        error: {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        }
      })
      throw error
    }
  }

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['students', page, search],
    queryFn: fetchStudents,
    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: 0,
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    refetch()
  }

  const handleRefresh = () => {
    refetch()
  }

  const students = data?.results || []
  const hasNextPage = data?.next
  const hasPreviousPage = data?.previous

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <div className="animate-pulse text-lg font-medium">Loading students...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-3">
        <h2 className="text-2xl font-semibold text-red-600">Error Loading Students</h2>
        <p className="text-gray-500">Status: {error.response?.status || 'Unknown'}</p>
        <p className="text-gray-500">Message: {error.message}</p>
        <button
          onClick={handleRefresh}
          className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Students</h1>
        <div className="flex gap-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow">
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
              onClick={() => {
                setSearch('')
                setPage(1)
              }}
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
                    <button className="text-blue-600 hover:underline text-sm">Edit</button>
                    <button className="text-red-600 hover:underline text-sm">Delete</button>
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

      {/* Debug Info (Collapsible) */}
      <details className="mt-6 bg-gray-50 rounded-md p-3 text-sm text-gray-600">
        <summary className="cursor-pointer font-semibold">Debug Information</summary>
        <pre className="overflow-x-auto mt-2">{JSON.stringify(debugInfo, null, 2)}</pre>
      </details>
    </div>
  )
}
