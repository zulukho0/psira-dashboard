// src/features/classes/pages/ManageClassPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar.jsx";
import { fetchStudents } from "../../students/students.api.js";
import { fetchClasses, updateClassStudents, removeStudentFromClass } from "../classes.api.js";
import { getCourse } from "../../courses/courses.api.js";

import {
  fetchSubjectsByCourse,               
  listSubjectResultsForClass,          
  patchSubjectResult,                  
} from "../../courses/subjects.api.js";

import {
  listResultsForClass,                 
  getOrCreateResultForStudentClass,    
} from "../results.api.js";

export default function ManageClassPage() {
  const { id } = useParams(); // class id
  const navigate = useNavigate();

  // Meta
  const [classData, setClassData] = useState(null);
  const [course, setCourse] = useState(null);
  const [subjects, setSubjects] = useState([]); 

  // Students assignment
  const [allStudents, setAllStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // Results and SubjectResults
  const [resultsByStudent, setResultsByStudent] = useState(new Map()); 
  const [subjectResultsMap, setSubjectResultsMap] = useState(new Map()); 

  // Local edits for marks
  const [marksEdits, setMarksEdits] = useState({});

  // UI
  const [loading, setLoading] = useState(true);
  const [savingStudents, setSavingStudents] = useState(false);
  const [savingMarks, setSavingMarks] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const selectedStudents = useMemo(
    () => allStudents.filter((s) => selectedIds.includes(s.id)),
    [allStudents, selectedIds]
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // 1) Load class (list+find; replace with getClass if you add it)
        const classRes = await fetchClasses({ page: 1, search: "" });
        const cls = classRes.results?.find((c) => c.id === Number(id));
        if (!cls) throw new Error("Class not found");
        if (!mounted) return;
        setClassData(cls);

        // 2) Course
        const courseRes = await getCourse(cls.course);
        if (!mounted) return;
        setCourse(courseRes);

        // 3) Subjects (SubjectTemplate) for course
        const subsRes = await fetchSubjectsByCourse({ course: cls.course, page: 1 });
        const subs = subsRes?.results || subsRes || [];
        if (!mounted) return;
        setSubjects(subs);

        // 4) All students
        const studentsRes = await fetchStudents({ page: 1, page_size: 1000 });
        const all = studentsRes.results || studentsRes || [];
        if (!mounted) return;
        setAllStudents(all);

        // 5) Selected students in class
        const currentIds = cls.students?.map((s) => s.id) || [];
        setSelectedIds(currentIds);

        // 6) Existing results for this class
        const resultsRes = await listResultsForClass({ classId: id });
        const resultsList = resultsRes?.results || resultsRes || [];
        const rByStudent = new Map();
        for (const r of resultsList) rByStudent.set(r.student, r);
        if (!mounted) return;
        setResultsByStudent(rByStudent);

        // 7) Existing SubjectResults for this class
        const srRes = await listSubjectResultsForClass({ classId: id });
        const srList = srRes?.results || srRes || [];
        const srMap = new Map();
        const initialEdits = {};
        for (const sr of srList) {
          srMap.set(`${sr.result}:${sr.template}`, sr);
          initialEdits[`${sr.result}:${sr.template}`] = {
            theory_marks: sr.theory_marks ?? "",
            practical_marks: sr.practical_marks ?? "",
          };
        }
        if (!mounted) return;
        setSubjectResultsMap(srMap);
        setMarksEdits(initialEdits);
      } catch (err) {
        console.error("Error loading data:", err);
        if (!mounted) return;
        setError(err.message || "Failed to load data");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const ensureResultForStudent = async (studentId) => {
    let result = resultsByStudent.get(studentId);
    if (!result) {
      result = await getOrCreateResultForStudentClass({
        student: studentId,
        class_instance: Number(id),
      });
      // Update map/state
      const newMap = new Map(resultsByStudent);
      newMap.set(studentId, result);
      setResultsByStudent(newMap);

      // Fetch SubjectResults for this new result
      const srRes = await listSubjectResultsForClass({ classId: id, resultId: result.id });
      const srList = srRes?.results || srRes || [];
      setSubjectResultsMap((prev) => {
        const copy = new Map(prev);
        for (const sr of srList) copy.set(`${sr.result}:${sr.template}`, sr);
        return copy;
      });
      setMarksEdits((prev) => {
        const copy = { ...prev };
        for (const sr of srList) {
          copy[`${sr.result}:${sr.template}`] = {
            theory_marks: sr.theory_marks ?? "",
            practical_marks: sr.practical_marks ?? "",
          };
        }
        return copy;
      });
    }
    return result;
  };

  const handleSaveStudents = async () => {
    setSavingStudents(true);
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
      setSavingStudents(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await removeStudentFromClass(id, studentId);
      setSelectedIds((prev) => prev.filter((sid) => sid !== studentId));

      // Optionally clear marks state for this student
      const result = resultsByStudent.get(studentId);
      if (result) {
        const toDelete = Object.keys(marksEdits).filter((k) => k.startsWith(`${result.id}:`));
        if (toDelete.length) {
          setMarksEdits((prev) => {
            const copy = { ...prev };
            for (const k of toDelete) delete copy[k];
            return copy;
          });
        }
      }
    } catch (err) {
      console.error("Failed to remove student:", err);
      const errorMessage = err?.response?.data?.detail || err?.message || "Failed to remove student";
      alert(errorMessage);
    }
  };

  const onChangeMarks = (resultId, templateId, field, value) => {
    setMarksEdits((prev) => ({
      ...prev,
      [`${resultId}:${templateId}`]: {
        ...(prev[`${resultId}:${templateId}`] || { theory_marks: "", practical_marks: "" }),
        [field]: value,
      },
    }));
  };

  const handleSaveMarks = async () => {
    setSavingMarks(true);
    setError("");
    try {
      // Ensure a Result exists for each selected student
      for (const student of selectedStudents) {
        await ensureResultForStudent(student.id);
      }

      // Patch SubjectResults for all edits
      const patches = [];
      for (const student of selectedStudents) {
        const result = resultsByStudent.get(student.id);
        if (!result) continue;

        for (const tmpl of subjects) {
          const key = `${result.id}:${tmpl.id}`;
          const edit = marksEdits[key];
          if (!edit) continue;

          const payload = {};
          if (edit.theory_marks !== "") payload.theory_marks = Number(edit.theory_marks);
          if (edit.practical_marks !== "") payload.practical_marks = Number(edit.practical_marks);
          if (!Object.keys(payload).length) continue;

          const sr = subjectResultsMap.get(key);
          if (!sr) continue;

          patches.push(patchSubjectResult(sr.id, payload));
        }
      }

      await Promise.all(patches);

      // Refresh SRs to reflect calculated totals and updated averages
      const srRes = await listSubjectResultsForClass({ classId: id });
      const srList = srRes?.results || srRes || [];
      const srMap = new Map();
      const freshEdits = {};
      for (const sr of srList) {
        srMap.set(`${sr.result}:${sr.template}`, sr);
        freshEdits[`${sr.result}:${sr.template}`] = {
          theory_marks: sr.theory_marks ?? "",
          practical_marks: sr.practical_marks ?? "",
        };
      }
      setSubjectResultsMap(srMap);
      setMarksEdits(freshEdits);

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
      setSavingMarks(false);
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

  const getResultIdForStudent = (studentId) => resultsByStudent.get(studentId)?.id;

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            Manage Class — {course?.title || course?.grade || "Course"} • Class #{classData?.id}
          </h1>
          <button
            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
            onClick={() => navigate("/classes")}
            disabled={savingStudents || savingMarks}
          >
            Back
          </button>
        </div>

        {/* Students section */}
        <div className="bg-white p-4 rounded shadow space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Students in this class</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                + Add Students
              </button>
              <button
                className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
                onClick={handleSaveStudents}
                disabled={savingStudents}
              >
                {savingStudents ? "Saving…" : "Save Students"}
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

        {/* Marks grid */}
        <div className="bg-white p-4 rounded shadow space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Enter Marks</h2>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={handleSaveMarks}
              disabled={savingMarks || selectedStudents.length === 0 || subjects.length === 0}
            >
              {savingMarks ? "Saving…" : "Save Marks"}
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
                        <div className="text-xs text-gray-500">Theory / Practical</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedStudents.map((st) => {
                    const resultId = getResultIdForStudent(st.id) || 0;
                    return (
                      <tr key={st.id} className="hover:bg-gray-50">
                        <td className="border p-2">
                          {st.first_name} {st.last_name}
                          {!getResultIdForStudent(st.id) && (
                            <div className="text-xs text-orange-600 mt-1">
                              Result will be created on save
                            </div>
                          )}
                        </td>
                        {subjects.map((sub) => {
                          const key = `${resultId}:${sub.id}`;
                          const values =
                            marksEdits[key] || { theory_marks: "", practical_marks: "" };
                          return (
                            <td key={sub.id} className="border p-2">
                              <div className="flex gap-2 items-center">
                                <input
                                  type="number"
                                  className="w-20 border border-gray-300 rounded px-2 py-1"
                                  value={values.theory_marks}
                                  onChange={(e) =>
                                    onChangeMarks(resultId, sub.id, "theory_marks", e.target.value)
                                  }
                                  placeholder="Theory"
                                />
                                <input
                                  type="number"
                                  className="w-20 border border-gray-300 rounded px-2 py-1"
                                  value={values.practical_marks}
                                  onChange={(e) =>
                                    onChangeMarks(
                                      resultId,
                                      sub.id,
                                      "practical_marks",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Practical"
                                />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Students Modal */}
      {showModal && (
        <AddStudentsModal
          allStudents={allStudents}
          selectedIds={selectedIds}
          onClose={() => setShowModal(false)}
          onAdd={(ids) => {
            setSelectedIds((prev) => [...new Set([...prev, ...ids])]);
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}

function AddStudentsModal({ allStudents, selectedIds, onClose, onAdd }) {
  const [modalSelection, setModalSelection] = useState([]);
  const [modalSearch, setModalSearch] = useState("");

  const filtered = allStudents.filter(
    (s) =>
      s.first_name.toLowerCase().includes(modalSearch.toLowerCase()) ||
      s.last_name.toLowerCase().includes(modalSearch.toLowerCase()) ||
      (s.id_number && s.id_number.includes(modalSearch))
  );

  return (
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
              {filtered.length > 0 ? (
                filtered.map((student) => {
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
                          onChange={() =>
                            setModalSelection((prev) =>
                              prev.includes(student.id)
                                ? prev.filter((sid) => sid !== student.id)
                                : [...prev, student.id]
                            )
                          }
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
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={() => onAdd(modalSelection)}
          >
            Add Selected
          </button>
        </div>
      </div>
    </div>
  );
}