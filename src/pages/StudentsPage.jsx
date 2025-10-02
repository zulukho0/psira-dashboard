import { useEffect, useState } from "react";

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/students/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch students");

        const data = await response.json();
        setStudents(data.results || []); // API returns {count, next, previous, results}
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [token]);

  if (loading) return <p className="p-4">Loading students...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Students</h1>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">First Name</th>
            <th className="border p-2">Last Name</th>
            <th className="border p-2">ID Number</th>
            <th className="border p-2">Contact</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((student) => (
              <tr key={student.id}>
                <td className="border p-2">{student.id}</td>
                <td className="border p-2">{student.first_name}</td>
                <td className="border p-2">{student.last_name}</td>
                <td className="border p-2">{student.id_number}</td>
                <td className="border p-2">{student.contact_number}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center p-4">
                No students found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StudentsPage;
