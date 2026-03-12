// ============================================
// CONFIGURACIÓN PARA PRODUCCIÓN EN RENDER
// ============================================
// Uso de la URL de Render para todas las peticiones
const API_BASE = 'https://helar-tec-grupo-7.onrender.com/api';

console.log('Conectando a API:', API_BASE);

// Obtener token del localStorage
function getToken() {
    return localStorage.getItem('token');
}

/** Wrapper de fetch que inyecta el token JWT y devuelve el JSON parseado.
 *  Reintenta una vez tras 3 s si el servidor está despertando (Render cold start). */
async function apiFetch(path, options = {}, _retry = true) {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers: headers,
            credentials: 'include'
        });

        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }

        return await res.json();

    } catch (error) {
        // Solo reintenta GET: las peticiones de mutación (POST/PUT/DELETE) no son idempotentes
        // y reintentarlas puede crear registros duplicados
        const metodo = (options.method || 'GET').toUpperCase();
        if (_retry && metodo === 'GET') {
            console.warn('Servidor no disponible, reintentando en 4 s...', path);
            await new Promise(r => setTimeout(r, 4000));
            return apiFetch(path, options, false);
        }
        console.error('Error en apiFetch:', error);
        throw error;
    }
}

// Funciones específicas para cada ruta (globales, sin módulos ES)
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

// API_BASE y apiFetch quedan disponibles globalmente