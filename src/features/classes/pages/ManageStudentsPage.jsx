// features/classes/pages/ManageStudentsPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar.jsx";
import { fetchStudents } from "../../students/students.api.js";
import { fetchClasses, updateClassStudents } from "../classes.api.js";

export default function ManageStudentsPage() {
  const { id } = useParams(); // class ID from URL
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const classRes = await fetchClasses({ page: 1, search: "" });
        const cls = classRes.results.find((c) => c.id === Number(id));
        if (!cls) throw new Error("Class not found");
        setClassData(cls);

        // Fetch all students
        const studentsData = await fetchStudents({ page: 1, page_size: 1000 });
        setStudents(studentsData.results || studentsData);

        // Pre-select only current students
        const currentIds = cls.students?.map((s) => s.id) || [];
        setSelectedIds(currentIds);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const toggleStudent = (studentId) => {
    setSelectedIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((sid) => sid !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await updateClassStudents(id, selectedIds);
      alert("Students updated successfully");
      navigate("/classes");
    } catch (err) {
      console.error("Failed to update students:", err);
      setError("Failed to update students");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          Loading class data...
        </div>
      </>
    );

  if (error)
    return (
      <>
        <Navbar />
        <div className="p-6 max-w-3xl mx-auto text-red-600">{error}</div>
      </>
    );

  const selectedStudents = students.filter((s) => selectedIds.includes(s.id));

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold mb-4">
          Manage Students for {classData.course_grade || "Class"} -{" "}
          {classData.batch_number}
        </h1>

        <div className="bg-white p-4 rounded shadow">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border text-left">Select</th>
                <th className="p-2 border text-left">Name</th>
                <th className="p-2 border text-left">Surname</th>
                <th className="p-2 border text-left">ID Number</th>
                <th className="p-2 border text-left">Mobile</th>
                <th className="p-2 border text-center">Marks</th>
                <th className="p-2 border text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {selectedStudents.length > 0 ? (
                selectedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="border p-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(student.id)}
                        onChange={() => toggleStudent(student.id)}
                      />
                    </td>
                    <td className="border p-2">{student.first_name}</td>
                    <td className="border p-2">{student.last_name}</td>
                    <td className="border p-2">{student.id_number || "—"}</td>
                    <td className="border p-2">{student.mobile || "—"}</td>
                    <td className="border p-2 text-center">{student.marks || "—"}</td>
                    <td className="border p-2 text-center">
                      {student.status || "Pending"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-4 text-gray-500">
                    No students added to this class yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
            onClick={() => navigate("/classes")}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </>
  );
}
