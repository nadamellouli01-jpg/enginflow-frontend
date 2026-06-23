import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const auth = sessionStorage.getItem('auth');
    if (auth) {
        const { email, motDePasse } = JSON.parse(auth);
        config.auth = { username: email, password: motDePasse };
    }
    return config;
});

// ✅ Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.response?.data?.error || 'Une erreur est survenue';

        if (error.response?.status === 401) {
            toast.error('🔒 Session expirée. Veuillez vous reconnecter.');
            sessionStorage.removeItem('auth');
            sessionStorage.removeItem('user');
            window.location.href = '/login';
        } else if (error.response?.status === 403) {
            toast.error('⛔ Accès refusé. Vous n\'avez pas les droits nécessaires.');
        } else if (error.response?.status === 404) {
            toast.error('🔍 Ressource non trouvée.');
        } else if (error.response?.status === 500) {
            toast.error('💥 Erreur serveur. Veuillez réessayer plus tard.');
        } else {
            toast.error(`❌ ${message}`);
        }

        return Promise.reject(error);
    }
);

export default api;