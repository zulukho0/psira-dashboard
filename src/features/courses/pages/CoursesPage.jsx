import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Navbar from '../../../components/Navbar.jsx';
import { fetchCourses } from '../courses.api.js';

export default function CoursesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['courses', page, search],
    queryFn: () => fetchCourses({ page, search }),
  });

  if (isLoading) return <><Navbar /><div>Loading courses...</div></>;
  if (error) return <><Navbar /><div>Error loading courses</div></>;

  const courses = data?.results || [];

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Courses</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md mb-4"
        >
          Add Course
        </button>

        <ul className="space-y-2">
          {courses.map(course => (
            <li key={course.id} className="border p-2 rounded">{course.name}</li>
          ))}
        </ul>
      </div>
    </>
  )
}
