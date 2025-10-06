import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../api/client'

export default function StudentsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['students', page, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (page) params.append('page', page)
      if (search) params.append('search', search)
      
      const response = await api.get(`/students/?${params.toString()}`)
      return response.data
    }
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    refetch()
  }

  if (isLoading) return <div className="loading">Loading students...</div>
  if (error) return <div className="error">Error: {error.message}</div>

  const students = data?.results || data || []
  const hasNextPage = data?.next
  const hasPreviousPage = data?.previous

  return (
    <div className="students-page">
      <div className="page-header">
        <h1>Students</h1>
        <button className="btn btn-primary">Add Student</button>
      </div>

      {/* Search Form */}
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
          {(search || page > 1) && (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setPage(1)
                refetch()
              }}
              className="btn btn-outline"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Students Table */}
      <div className="students-table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>ID Number</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map(student => (
                <tr key={student.id}>
                  <td>{student.first_name} {student.last_name}</td>
                  <td>{student.id_number}</td>
                  <td>{student.contact_number}</td>
                  <td>
                    <button className="btn btn-sm btn-outline">Edit</button>
                    <button className="btn btn-sm btn-danger">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(hasNextPage || hasPreviousPage || data?.count > 0) && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {students.length} of {data?.count || 0} students
          </div>
          <div className="pagination-controls">
            <button
              className="btn btn-outline"
              onClick={() => setPage(page - 1)}
              disabled={!hasPreviousPage || page <= 1}
            >
              Previous
            </button>
            <span className="page-info">
              Page {page} of {data?.total_pages || Math.ceil((data?.count || 0) / 20)}
            </span>
            <button
              className="btn btn-outline"
              onClick={() => setPage(page + 1)}
              disabled={!hasNextPage}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}