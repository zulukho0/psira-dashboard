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
        // Fetch class details
        const classRes = await fetchClasses({ page: 1, search: "" });
        const cls = classRes.results.find((c) => c.id === Number(id));
        if (!cls) throw new Error("Class not found");
        setClassData(cls);

        // Fetch all students
        const studentsData = await fetchStudents({ page: 1, page_size: 1000 });
        setStudents(studentsData.results || studentsData);

        // Pre-select current students
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
      navigate("/classes"); // go back to classes page
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

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold mb-4">
          Manage Students for {classData.course_grade || "Class"} - {classData.batch_number}
        </h1>

        <div className="bg-white p-4 rounded shadow max-h-[500px] overflow-y-auto">
          {students.map((student) => (
            <div key={student.id} className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                checked={selectedIds.includes(student.id)}
                onChange={() => toggleStudent(student.id)}
                id={`student-${student.id}`}
              />
              <label htmlFor={`student-${student.id}`}>
                {student.first_name} {student.last_name} ({student.psira_number})
              </label>
            </div>
          ))}
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
