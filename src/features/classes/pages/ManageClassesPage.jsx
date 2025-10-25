// src/features/classes/pages/ManageClassPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar.jsx";
import { fetchStudents } from "../../students/students.api.js";
import { fetchClasses, updateClassStudents, removeStudentFromClass } from "../classes.api.js";
import { getCourse } from "../../courses/courses.api.js";
import { fetchSubjectsByCourse } from "../../courses/subjects.api.js";
import { listResultsForClass, upsertResult } from "../../results/results.api.js";

export default function ManageClassPage() {
  const { id } = useParams(); // class id
  const navigate = useNavigate();

  // Metadata
  const [classData, setClassData] = useState(null);
  const [course, setCourse] = useState(null);
  const [subjects, setSubjects] = useState([]);

  // Students assignment
  const [allStudents, setAllStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // Results
  const [initialResults, setInitialResults] = useState([]);
  const [scores, setScores] = useState({}); 

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Modal states for adding/removing students
  const [showModal, setShowModal] = useState(false);
  const [modalSelection, setModalSelection] = useState([]);
  const [modalSearch, setModalSearch] = useState("");

  // Build a map to find existing result by student+subject quickly
  const resultMap = useMemo(() => {
    const m = new Map();
    for (const r of initialResults || []) {
      // assuming r has subject, student, class, score
      if (r.student != null && r.subject != null) {
        m.set(`${r.student}:${r.subject}`, r);
      }
    }
    return m;
  }, [initialResults]);

  // Initialize page data
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        // 1) Load class list (or replace with a direct getClass(id) if available)
        const classRes = await fetchClasses({ page: 1, search: "" });
        const cls = classRes.results?.find((c) => c.id === Number(id));
        if (!cls) throw new Error("Class not found");
        if (!mounted) return;
        setClassData(cls);

        // 2) Load course
        const courseRes = await getCourse(cls.course);
        if (!mounted) return;
        setCourse(courseRes);

        // 3) Load subjects for this course (expects ?course=<id>)
        const subsRes = await fetchSubjectsByCourse({ course: cls.course, page: 1 });
        const subs = subsRes?.results || subsRes || [];
        if (!mounted) return;
        setSubjects(subs);

        // 4) Load all students (or use your classData.students if available)
        const studentsRes = await fetchStudents({ page: 1, page_size: 1000 });
        const all = studentsRes.results || studentsRes || [];
        if (!mounted) return;
        setAllStudents(all);

        // 5) Load selected students from classData.students (if present)
        const currentIds = cls.students?.map((s) => s.id) || [];
        setSelectedIds(currentIds);

        // 6) Load existing results for this class to prefill scores
        const resultsRes = await listResultsForClass({ classId: id });
        const resultsList = resultsRes?.results || resultsRes || [];
        if (!mounted) return;
        setInitialResults(resultsList);

        // 7) Seed scores from results
        const initialScores = {};
        for (const r of resultsList) {
          if (r.student != null && r.subject != null) {
            initialScores[`${r.student}:${r.subject}`] = r.score ?? "";
          }
        }
        setScores(initialScores);
      } catch (err) {
        console.error("Error loading data:", err);
        if (!mounted) return;
        setError(err.message || "Failed to load data");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Add/remove students modal helpers
  const openModal = () => {
    setModalSelection([]);
    setModalSearch("");
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const toggleModalStudent = (studentId) => {
    setModalSelection((prev) =>
      prev.includes(studentId) ? prev.filter((sid) => sid !== studentId) : [...prev, studentId]
    );
  };

  const addSelectedFromModal = () => {
    setSelectedIds((prev) => [...new Set([...prev, ...modalSelection])]);
    closeModal();
  };

  // Remove a student immediately
  const handleRemoveStudent = async (studentId) => {
    try {
      await removeStudentFromClass(id, studentId);
      setSelectedIds((prev) => prev.filter((sid) => sid !== studentId));
      // Optional: remove scores in UI state as well
      const toDeleteKeys = Object.keys(scores).filter((k) => k.startsWith(`${studentId}:`));
      if (toDeleteKeys.length) {
        setScores((prev) => {
          const copy = { ...prev };
          for (const k of toDeleteKeys) delete copy[k];
          return copy;
        });
      }
    } catch (err) {
      console.error("Failed to remove student:", err);
      const errorMessage = err?.response?.data?.detail || err?.message || "Failed to remove student";
      alert(errorMessage);
    }
  };

  // Save assigned students for this class
  const handleSaveStudents = async () => {
    setSaving(true);
    setError("");
    try {
      await updateClassStudents(id, selectedIds);
      alert("Students updated successfully!");
    } catch (err) {
      console.error("Failed to update students:", err);
      const errorMessage =
        err?.response?.data?.detail ||
        Object.entries(err?.response?.data || {})
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
          .join(", ") ||
        err?.message ||
        "Failed to update students";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Scores handling
  const onChangeScore = (studentId, subjectId, value) => {
    setScores((prev) => ({
      ...prev,
      [`${studentId}:${subjectId}`]: value,
    }));
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    setError("");
    try {
      const payloads = [];
      for (const sid of selectedIds) {
        for (const sub of subjects) {
          const key = `${sid}:${sub.id}`;
          const val = scores[key];
          if (val === undefined || val === null || val === "") continue;
          const numeric = Number(val);
          if (Number.isNaN(numeric)) continue;

          const existing = resultMap.get(key);
          payloads.push(
            upsertResult({
              id: existing?.id,
              student: sid,
              classId: Number(id),
              subject: sub.id,
              score: numeric,
            })
          );
        }
      }
      await Promise.all(payloads);
      // Refresh result cache in UI state
      const resultsRes = await listResultsForClass({ classId: id });
      const resultsList = resultsRes?.results || resultsRes || [];
      setInitialResults(resultsList);
      alert("Marks saved successfully!");
    } catch (err) {
      console.error("Failed to save marks:", err);
      const msg =
        err?.response?.data?.detail ||
        (err?.response?.data && JSON.stringify(err.response.data)) ||
        err?.message ||
        "Failed to save marks";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          Loading class, course, students, and subjects…
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="p-6 max-w-3xl mx-auto text-red-600">{error}</div>
      </>
    );
  }

  const selectedStudents = allStudents.filter((s) => selectedIds.includes(s.id));
  const filteredModalStudents = allStudents.filter(
    (s) =>
      s.first_name.toLowerCase().includes(modalSearch.toLowerCase()) ||
      s.last_name.toLowerCase().includes(modalSearch.toLowerCase()) ||
      (s.id_number && s.id_number.includes(modalSearch))
  );

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            Manage Class — {course?.title || course?.grade || "Course"} • Class #{classData?.id}
          </h1>
          <div className="flex gap-2">
            <button
              className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
              onClick={() => navigate("/classes")}
              disabled={saving}
            >
              Back
            </button>
          </div>
        </div>

        {/* Section: Students in class */}
        <div className="bg-white p-4 rounded shadow space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Students in this class</h2>
            <div className="flex gap-2">
              <button
                onClick={openModal}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                + Add Students
              </button>
              <button
                className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
                onClick={handleSaveStudents}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Students"}
              </button>
            </div>
          </div>

          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border text-left">Name</th>
                <th className="p-2 border text-left">Surname</th>
                <th className="p-2 border text-left">ID Number</th>
                <th className="p-2 border text-left">Mobile</th>
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
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleRemoveStudent(student.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-gray-500">
                    No students added to this class yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Section: Marks entry grid */}
        <div className="bg-white p-4 rounded shadow space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Enter Marks</h2>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={handleSaveMarks}
              disabled={saving || selectedStudents.length === 0 || subjects.length === 0}
            >
              {saving ? "Saving…" : "Save Marks"}
            </button>
          </div>

          {subjects.length === 0 ? (
            <p className="text-gray-500">No subjects found for this course.</p>
          ) : selectedStudents.length === 0 ? (
            <p className="text-gray-500">Add students to this class to enter marks.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border p-2 text-left">Student</th>
                    {subjects.map((sub) => (
                      <th key={sub.id} className="border p-2 text-left">
                        {sub.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-gray-50">
                      <td className="border p-2">
                        {st.first_name} {st.last_name}
                      </td>
                      {subjects.map((sub) => {
                        const key = `${st.id}:${sub.id}`;
                        return (
                          <td key={sub.id} className="border p-2">
                            <input
                              type="number"
                              className="w-24 border border-gray-300 rounded px-2 py-1"
                              value={scores[key] ?? ""}
                              onChange={(e) => onChangeScore(st.id, sub.id, e.target.value)}
                              placeholder="Score"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add students */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 relative">
            <h2 className="text-xl font-semibold mb-4">Select Students</h2>

            <input
              type="text"
              placeholder="Search students by name, surname, or ID..."
              className="border border-gray-300 w-full px-3 py-2 rounded mb-4"
              value={modalSearch}
              onChange={(e) => setModalSearch(e.target.value)}
            />

            <div className="overflow-y-auto max-h-96">
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
                  {filteredModalStudents.length > 0 ? (
                    filteredModalStudents.map((student) => {
                      const alreadyAdded = selectedIds.includes(student.id);
                      return (
                        <tr
                          key={student.id}
                          className={`hover:bg-gray-50 ${alreadyAdded ? "bg-gray-100" : ""}`}
                        >
                          <td className="border p-2 text-center">
                            <input
                              type="checkbox"
                              checked={modalSelection.includes(student.id)}
                              disabled={alreadyAdded}
                              onChange={() => toggleModalStudent(student.id)}
                            />
                          </td>
                          <td className="border p-2">{student.first_name}</td>
                          <td className="border p-2">{student.last_name}</td>
                          <td className="border p-2">{student.id_number || "—"}</td>
                          <td className="border p-2">{student.mobile || "—"}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center p-4 text-gray-500">
                        No students found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

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