import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/Navbar.jsx';
import { getStudents } from '../api/students';

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['students', { page, search }],
    queryFn: () => getStudents({ page, search }),
    keepPreviousData: true,
  });

  const results = data?.results ?? [];
  const count = data?.count ?? 0;
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Students</h1>
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID"
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>

        {isLoading && <div>Loading students...</div>}
        {isError && <div className="text-red-600">Error: {error?.message || 'Failed to load'}</div>}

        {!isLoading && !isError && results.length === 0 && (
          <div className="bg-white p-6 rounded-md shadow">No students found.</div>
        )}

        {!isLoading && !isError && results.length > 0 && (
          <div className="bg-white rounded-md shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 border-b">ID</th>
                  <th className="text-left px-4 py-2 border-b">First Name</th>
                  <th className="text-left px-4 py-2 border-b">Second Name</th>
                  <th className="text-left px-4 py-2 border-b">Last Name</th>
                  <th className="text-left px-4 py-2 border-b">ID Number</th>
                  <th className="text-left px-4 py-2 border-b">Contact</th>
                  <th className="text-left px-4 py-2 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((s) => (
                  <tr key={s.id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-2 border-b">{s.id}</td>
                    <td className="px-4 py-2 border-b">{s.first_name}</td>
                    <td className="px-4 py-2 border-b">{s.second_name || '-'}</td>
                    <td className="px-4 py-2 border-b">{s.last_name}</td>
                    <td className="px-4 py-2 border-b">{s.id_number}</td>
                    <td className="px-4 py-2 border-b">{s.contact_number || '-'}</td>
                    <td className="px-4 py-2 border-b">
                      <div className="flex gap-2">
                        <button className="px-2 py-1 text-sm bg-gray-100 rounded">Edit</button>
                        <button className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">Total: {count}</div>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-2 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-2 py-2 text-sm">Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}