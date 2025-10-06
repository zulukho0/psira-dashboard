import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../api/client'

export default function StudentsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await api.get('/students/')
      return response.data
    }
  })

  if (isLoading) return <div className="loading">Loading students...</div>
  if (error) return <div className="error">Error: {error.message}</div>

  const students = data?.results || data || []

  return (
    <div className="students-page">
      <div className="page-header">
        <h1>Students</h1>
        <button className="btn btn-primary">Add Student</button>
      </div>
      
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
            {students.map(student => (
              <tr key={student.id}>
                <td>{student.first_name} {student.last_name}</td>
                <td>{student.id_number}</td>
                <td>{student.contact_number}</td>
                <td>
                  <button className="btn btn-sm btn-outline">Edit</button>
                  <button className="btn btn-sm btn-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}