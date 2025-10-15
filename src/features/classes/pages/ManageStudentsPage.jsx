// features/classes/pages/ManageStudentsPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar.jsx";
import { fetchStudents } from "../../students/students.api.js";
import { fetchClasses, updateClassStudents } from "../classes.api.js";

export default function ManageStudentsPage() {
  const { id } = useParams(); // class ID
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalSelection, setModalSelection] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const classRes = await fetchClasses({ page: 1, search: "" });
        const cls = classRes.results.find((c) => c.id === Number(id));
        if (!cls) throw new Error("Class not found");
        setClassData(cls);

        const studentsRes = await fetchStudents({ page: 1, page_size: 1000 });
        setAllStudents(studentsRes.results || studentsRes);

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
    try {
      await updateClassStudents(id, selectedIds);
      alert("Students updated successfully!");
      navigate("/classes");
    } catch (err) {
      console.error("Failed to update students:", err);
      setError("Failed to update students");
    } finally {
      setSaving(false);
    }
  };

  const openModal = () => {
    setModalSelection([]);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const toggleModalStudent = (studentId) => {
    setModalSelection((prev) =>
      prev.includes(studentId)
        ? prev.filter((sid) => sid !== studentId)
        : [...prev, studentId]
    );
  };

  const addSelectedFromModal = () => {
    setSelectedIds((prev) => [...new Set([...prev, ...modalSelection])]);
    closeModal();
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

  const selectedStudents = allStudents.filter((s) => selectedIds.includes(s.id));

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            Manage Students for {classData.course_grade || "Class"} -{" "}
            {classData.batch_number}
          </h1>
          <button
            onClick={openModal}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            + Add Students
          </button>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border text-left">Name</th>
                <th className="p-2 border text-left">Surname</th>
                <th className="p-2 border text-left">ID Number</th>
                <th className="p-2 border text-left">Mobile</th>
                <th className="p-2 border text-center">Marks</th>
                <th className="p-2 border text-center">Status</th>
                <th className="p-2 border text-center">Remove</th>
              </tr>
            </thead>
            <tbody>
              {selectedStudents.length > 0 ? (
                selectedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="border p-2">{student.first_name}</td>
                    <td className="border p-2">{student.last_name}</td>
                    <td className="border p-2">{student.id_number || "—"}</td>
                    <td className="border p-2">{student.mobile || "—"}</td>
                    <td className="border p-2 text-center">
                      {student.marks || "—"}
                    </td>
                    <td className="border p-2 text-center">
                      {student.status || "Pending"}
                    </td>
                    <td className="border p-2 text-center">
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() =>
                          setSelectedIds((prev) =>
                            prev.filter((sid) => sid !== student.id)
                          )
                        }
                      >
                        Remove
                      </button>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 relative">
            <h2 className="text-xl font-semibold mb-4">Select Students</h2>

            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border text-left">Select</th>
                  <th className="p-2 border text-left">Name</th>
                  <th className="p-2 border text-left">Surname</th>
                  <th className="p-2 border text-left">ID Number</th>
                  <th className="p-2 border text-left">Mobile</th>
                </tr>
              </thead>
              <tbody>
                {allStudents.length > 0 ? (
                  allStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="border p-2 text-center">
                        <input
                          type="checkbox"
                          checked={modalSelection.includes(student.id)}
                          onChange={() => toggleModalStudent(student.id)}
                        />
                      </td>
                      <td className="border p-2">{student.first_name}</td>
                      <td className="border p-2">{student.last_name}</td>
                      <td className="border p-2">{student.id_number || "—"}</td>
                      <td className="border p-2">{student.mobile || "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-4 text-gray-500">
                      No students available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={addSelectedFromModal}
              >
                Add Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
