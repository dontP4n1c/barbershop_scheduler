import axios from 'axios'

const base = import.meta.env.VITE_API_URL || '/'

const instance = axios.create({
  baseURL: base,
})

// attach token from localStorage if present
instance.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token')
    if (token) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` }
  } catch (e) {}
  return config
})

export default instance
