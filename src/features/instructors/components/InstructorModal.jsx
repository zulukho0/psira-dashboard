export default function InstructorModal({ isOpen, onClose, onSubmit, formData, onChange, isEdit }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit Instructor' : 'Add Instructor'}</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            name="first_name"
            placeholder="First Name"
            value={formData.first_name}
            onChange={onChange}
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
            required
          />
          <input
            name="last_name"
            placeholder="Last Name"
            value={formData.last_name}
            onChange={onChange}
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
            required
          />
          <input
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={onChange}
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
            required
            type="email"
          />
          <input
            name="contact_number"
            placeholder="Contact Number"
            value={formData.contact_number}
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
