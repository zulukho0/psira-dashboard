import api from '../../api/client'

export async function fetchInstructors({ page = 1, search = '' }) {
  const res = await api.get(`/instructors/?page=${page}&search=${search}`)
  return res.data
}

export async function createInstructor(data) {
  const formData = new FormData()
  for (const key in data) {
    if (data[key]) formData.append(key, data[key])
  }
  const res = await api.post('/instructors/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function updateInstructor(id, data) {
  const formData = new FormData()
  for (const key in data) {
    if (key === 'signature') {
      if (data.signature instanceof File) {
        formData.append('signature', data.signature)
      }
    } else {
      formData.append(key, data[key])
    }
  }

  const res = await api.put(`/instructors/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function deleteInstructor(id) {
  const res = await api.delete(`/instructors/${id}/`)
  return res.data
}
