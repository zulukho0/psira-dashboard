import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Track refresh in progress to prevent multiple concurrent refreshes
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 by refreshing token once and retrying the request
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config
    
    // If error is 401/403 and we haven't retried yet
    if ((error?.response?.status === 401 || error?.response?.status === 403) && 
        !originalRequest._retry && 
        error?.response?.data?.code === 'token_not_valid') {
      
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }
      
      // Start refresh process
      originalRequest._retry = true
      isRefreshing = true
      
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }
        
        // Use the base axios instance to avoid interceptors
        const response = await axios.post(`${API_BASE}/api/token/refresh/`, {
          refresh: refreshToken
        })
        
        const { access } = response.data
        localStorage.setItem('access_token', access)
        
        // Update default authorization header
        api.defaults.headers.common.Authorization = `Bearer ${access}`
        
        // Process queued requests with new token
        processQueue(null, access)
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, clear tokens and process queue with error
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        processQueue(refreshError, null)
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    return Promise.reject(error)
  }
)

export default api