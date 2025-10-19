import { useState } from 'react';

export default function SubjectManagement({ subjects, onSubjectsChange }) {
  const [newSubject, setNewSubject] = useState({ name: '', max_theory: 100, max_practical: 100 });

  const handleAddSubject = () => {
    if (newSubject.name.trim()) {
      onSubjectsChange([...subjects, { ...newSubject }]);
      setNewSubject({ name: '', max_theory: 100, max_practical: 100 });
    }
  };

  const handleRemoveSubject = (index) => {
    onSubjectsChange(subjects.filter((_, i) => i !== index));
  };

  const handleSubjectChange = (index, field, value) => {
    onSubjectsChange(subjects.map((subject, i) => 
      i === index ? { ...subject, [field]: value } : subject
    ));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Subjects</h3>
      
      {/* Add new subject form */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="font-medium mb-2">Add New Subject</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            type="text"
            placeholder="Subject Name"
            value={newSubject.name}
            onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
          <input
            type="number"
            placeholder="Max Theory"
            value={newSubject.max_theory}
            onChange={(e) => setNewSubject({ ...newSubject, max_theory: parseInt(e.target.value) || 0 })}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
          <input
            type="number"
            placeholder="Max Practical"
            value={newSubject.max_practical}
            onChange={(e) => setNewSubject({ ...newSubject, max_practical: parseInt(e.target.value) || 0 })}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
          <button
            type="button"
            onClick={handleAddSubject}
            className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700"
          >
            Add
          </button>
        </div>
      </div>

      {/* Subjects list */}
      <div className="space-y-2">
        {subjects.map((subject, index) => (
          <div key={index} className="flex items-center gap-2 p-2 border border-gray-200 rounded-md">
            <input
              type="text"
              placeholder="Subject Name"
              value={subject.name}
              onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-2 py-1"
            />
            <input
              type="number"
              placeholder="Max Theory"
              value={subject.max_theory}
              onChange={(e) => handleSubjectChange(index, 'max_theory', parseInt(e.target.value) || 0)}
              className="w-24 border border-gray-300 rounded-md px-2 py-1"
            />
            <input
              type="number"
              placeholder="Max Practical"
              value={subject.max_practical}
              onChange={(e) => handleSubjectChange(index, 'max_practical', parseInt(e.target.value) || 0)}
              className="w-24 border border-gray-300 rounded-md px-2 py-1"
            />
            <button
              type="button"
              onClick={() => handleRemoveSubject(index)}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ))}
        
        {subjects.length === 0 && (
          <p className="text-gray-500 text-center py-4">No subjects added yet</p>
        )}
      </div>
    </div>
  );
}