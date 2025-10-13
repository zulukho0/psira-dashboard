export default function CourseModal({ isOpen, onClose, onSubmit, formData, onChange, isEdit }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit Course' : 'Add Course'}</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            name="grade"
            placeholder="Grade"
            value={formData.grade}
            onChange={onChange}
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
            required
          />
          <input
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={onChange}
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
            required
          />
          <input
            name="price"
            placeholder="Price"
            type="number"
            value={formData.price}
            onChange={onChange}
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
            required
          />
          <div className="flex justify-end gap-2">
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
              {isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
