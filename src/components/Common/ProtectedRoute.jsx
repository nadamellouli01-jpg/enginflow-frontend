import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    // ✅ Affichage pendant le chargement
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#006233] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 mt-3 text-sm font-medium">Chargement...</p>
                </div>
            </div>
        );
    }

    // ✅ Si l'utilisateur n'est pas connecté → redirection vers login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // ✅ Vérifier que le rôle est valide (si présent)
    if (!user.role) {
        // Nettoyer les données invalides
        localStorage.removeItem('user');
        localStorage.removeItem('auth');
        return <Navigate to="/login" replace />;
    }

    // ✅ Vérifier les rôles autorisés (si spécifiés)
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Rediriger vers la page d'accueil si le rôle n'est pas autorisé
        return <Navigate to="/" replace />;
    }

    // ✅ Tout est bon, afficher le contenu protégé
    return children;
};

export default ProtectedRoute;