// ============================================
// CONFIGURACIÓN PARA PRODUCCIÓN EN RENDER
// ============================================
// FORZAMOS el uso de la URL de Render para todas las peticiones
const API_BASE = 'https://helar-tec-grupo-7.onrender.com/api';

console.log('Conectando a API:', API_BASE);

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
    updateProducto: (id, data) => apiFetch(`/productos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    deleteProducto: (id) => apiFetch(`/productos/${id}`, {
        method: 'DELETE'
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