import { useEffect, useState } from 'react';

export default function InstructorModal({ isOpen, onClose, onSubmit, formData, handleChange }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    // Show existing signature when editing
    if (formData.signature && typeof formData.signature === 'string') {
      setPreview(formData.signature);
    } else {
      setPreview(null);
    }
  }, [formData.signature]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleChange({ target: { name: 'signature', value: file } });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {formData.id ? 'Edit Instructor' : 'Add Instructor'}
        </h2>

        <form
          onSubmit={onSubmit}
          className="space-y-3"
          encType="multipart/form-data"
        >
          <input
            name="first_name"
            placeholder="First Name"
            value={formData.first_name || ''}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
            required
          />

          <input
            name="last_name"
            placeholder="Last Name"
            value={formData.last_name || ''}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
            required
          />

          <input
            name="psira_number"
            placeholder="PSIRA Number"
            value={formData.psira_number || ''}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
            required
          />

          <input
            name="contact_number"
            placeholder="Contact Number"
            value={formData.contact_number || ''}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
            required
          />

          {/* Signature Upload */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">Signature</label>
            <input
              type="file"
              name="signature"
              accept="image/*"
              onChange={handleFileChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
              required={!formData.id}
            />

            {/* ✅ Signature Preview */}
            {preview && (
              <div className="mt-3 flex justify-center">
                <img
                  src={preview}
                  alt="Signature Preview"
                  className="h-24 w-auto object-contain border rounded-md shadow-sm"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3">
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
              {formData.id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
