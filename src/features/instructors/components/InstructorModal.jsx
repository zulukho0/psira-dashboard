import { useEffect, useState } from 'react'

export default function InstructorModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  handleChange,
}) {
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (formData.signature && typeof formData.signature === 'string') {
      // When editing, show existing image URL
      setPreview(formData.signature)
    } else if (!formData.signature) {
      setPreview(null)
    }
  }, [formData.signature])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleChange({ target: { name: 'signature', value: file } })
      setPreview(URL.createObjectURL(file))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {formData.id ? 'Edit Instructor' : 'Add Instructor'}
        </h2>

        <form
          onSubmit={onSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                PSIRA Number
              </label>
              <input
                type="text"
                name="psira_number"
                value={formData.psira_number}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Contact Number
              </label>
              <input
                type="text"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Signature Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Signature
            </label>
            <input
              type="file"
              name="signature"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            />
            {preview && (
              <div className="mt-2">
                <img
                  src={preview}
                  alt="Signature Preview"
                  className="h-20 border rounded-md object-contain"
                />
              </div>
            )}
          </div>

          {/* Buttons */}
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
              {formData.id ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
