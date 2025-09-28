import axios from 'axios'


const api = axios.create({ baseURL: '/api' })


api.interceptors.request.use(cfg => {
    const token = localStorage.getItem('access')
    if (token) { cfg.headers.Authorization = `Bearer ${token}` }
    return cfg
})


export const login = async (username, password) => {
    const { data } = await api.post('/auth/login/', { username, password })
    localStorage.setItem('access', data.access)
    localStorage.setItem('refresh', data.refresh)
    window.dispatchEvent(new Event('auth-change'))
}


export const registerUser = (username, password) => api.post('/auth/register/', { username, password })
export const listPosts = (page = 1) => api.get('/posts/', { params: { page } })
export const listPostsByUrl = (url) => {
    // Ubah absolute/relative URL dari DRF jadi path yang cocok dengan baseURL '/api'
    try {
        const u = new URL(url);
        // contoh: '/api/posts/?page=2' -> '/posts/?page=2'
        const path = (u.pathname + u.search).replace(/^\/api\//, '/');
        return api.get(path);
    } catch {
        // kalau sudah relatif, tetap hilangkan prefix '/api/' agar tidak dobel
        const path = url.replace(/^\/api\//, '/');
        return api.get(path);
    }
};

export const createPost = (text) => api.post('/posts/', { text })
export const getPostGeoJSON = () => api.get('/posts.geojson')
export const getPostById = (id) => api.get(`/posts/${id}/`)


export default api