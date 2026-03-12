// Detectar entorno y usar la URL correcta
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'  // Desarrollo local
    : 'https://helar-tec-grupo-7.onrender.com/api';  // Producción en Render

console.log('API Base URL:', API_BASE);

// Obtener token del localStorage
function getToken() {
    return localStorage.getItem('token');
}

/** Wrapper de fetch que inyecta el token JWT y devuelve el JSON parseado */
async function apiFetch(path, options = {}) {
    const token = getToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };
    
    // Si hay token, agregarlo al header Authorization
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const res = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers: headers,
            credentials: 'include'
        });
        
        // Verificar si la respuesta es OK
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }
        
        // Parsear JSON
        const data = await res.json();
        return data;
        
    } catch (error) {
        console.error('Error en apiFetch:', error);
        throw error;
    }
}

// Exportar funciones específicas para cada ruta
const api = {
    // Auth
    login: (credentials) => apiFetch('/auth/login', { 
        method: 'POST', 
        body: JSON.stringify(credentials) 
    }),
    register: (userData) => apiFetch('/auth/register', { 
        method: 'POST', 
        body: JSON.stringify(userData) 
    }),
    
    // Productos
    getProductos: () => apiFetch('/productos'),
    getProducto: (id) => apiFetch(`/productos/${id}`),
    createProducto: (data) => apiFetch('/productos', { 
        method: 'POST', 
        body: JSON.stringify(data) 
    }),
    
    // Usuarios
    getUsuarios: () => apiFetch('/usuarios'),
    
    // Dashboard
    getDashboard: () => apiFetch('/dashboard'),
    
    // Health check
    health: () => apiFetch('/health')
};

// Exportar para usar en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { apiFetch, api, API_BASE };
}