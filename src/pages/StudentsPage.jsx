import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import api from '../api/client'

export default function StudentsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debugInfo, setDebugInfo] = useState({})

  const fetchStudents = async () => {
    try {
      // Debug: Check if token exists
      const token = localStorage.getItem('access_token')
      setDebugInfo(prev => ({ ...prev, token: token ? 'Present' : 'Missing' }))
      
      // Debug: Check API base
      const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
      setDebugInfo(prev => ({ ...prev, apiBase }))
      
      // Build URL
      const params = new URLSearchParams()
      if (page) params.append('page', page.toString())
      if (search) params.append('search', search)
      
      const url = `/students/${params.toString() ? '?' + params.toString() : ''}`
      setDebugInfo(prev => ({ ...prev, url }))
      
      const response = await api.get(url)
      setDebugInfo(prev => ({ ...prev, responseStatus: response.status }))
      
      return response.data
    } catch (error) {
      setDebugInfo(prev => ({ 
        ...prev, 
        error: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
          data: error.response?.data
        }
      }))
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

  // Loading states
  if (isLoading && !data) {
    return (
      <div className="loading-container">
        <div className="loading">Loading students...</div>
        <div className="debug-info">
          <h3>Debug Info:</h3>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Students</h2>
        <p><strong>Status:</strong> {error.response?.status}</p>
        <p><strong>Status Text:</strong> {error.response?.statusText}</p>
        <p><strong>Message:</strong> {error.message}</p>
        <div className="debug-info">
          <h3>Debug Info:</h3>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          <pre>{JSON.stringify(error.response?.data || error, null, 2)}</pre>
        </div>
        <button className="btn btn-primary" onClick={handleRefresh}>
          Try Again
        </button>
      </div>
    )
  }

  const students = data?.results || []
  const hasNextPage = data?.next
  const hasPreviousPage = data?.previous

  return (
    <div className="students-page">
      <div className="page-header">
        <h1>Students</h1>
        <div className="header-actions">
          <button className="btn btn-primary">Add Student</button>
          <button className="btn btn-outline" onClick={handleRefresh}>
            Refresh
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <details className="debug-details">
        <summary>Debug Information</summary>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      </details>

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
              }}
              className="btn btn-outline"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Refresh indicator */}
      {isFetching && (
        <div className="refresh-indicator">
          Refreshing data...
        </div>
      )}

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
              Page {page}
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