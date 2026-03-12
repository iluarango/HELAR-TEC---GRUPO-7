const API_BASE = 'http://localhost:3000/api'

/** Wrapper de fetch que inyecta el token JWT y devuelve el JSON parseado */
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
