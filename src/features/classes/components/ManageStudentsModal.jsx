import { useEffect, useState } from "react";
import { fetchStudents } from "../../students/students.api.js";
import { updateClassStudents } from "../classes.api.js";

export default function ManageStudentsModal({ isOpen, onClose, classId, currentStudents = [], onUpdate }) {
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const loadStudents = async () => {
      setLoading(true);
      try {
        const data = await fetchStudents({ page: 1, page_size: 1000 }); // get all students
        setStudents(data.results || data);
        // pre-select students already in the class
        setSelectedIds(currentStudents.map(s => s.id));
      } catch (err) {
        console.error("Failed to load students:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [isOpen, currentStudents]);

  const toggleStudent = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateClassStudents(classId, selectedIds);
      onUpdate(); // refresh parent page data
      onClose();
    } catch (err) {
      console.error("Failed to update students:", err);
      alert("Failed to update students.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-start pt-20 z-50 overflow-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <h2 className="text-xl font-semibold mb-4">Manage Students</h2>

        {loading ? (
          <p>Loading students...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[400px] overflow-y-auto">
            {students.map((student) => (
              <div key={student.id} className="flex items-center gap-2">
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

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
