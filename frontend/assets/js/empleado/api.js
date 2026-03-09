const API_BASE = 'http://localhost:3000/api'

async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            ...(options.headers || {})
        }
    })
    return res.json()
}
