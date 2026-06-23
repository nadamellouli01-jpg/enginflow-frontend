import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notifCount, setNotifCount] = useState(0);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const response = await api.get('/demandes/modifiees');
            setNotifCount(response.data.length);
        } catch (error) {
            console.error('Erreur chargement notifications:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="bg-white/95 backdrop-blur-sm shadow-md sticky top-0 z-20 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex justify-between items-center">
                {/* Logo et titre */}
                <div className="flex items-center gap-3">
                    <div className="bg-gray-100 w-9 h-9 rounded-xl flex items-center justify-center shadow-md">
                        <img src="/ocp.png" alt="OCP" className="w-7 h-7 object-contain" />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold text-gray-800">
                            Engin<span className="text-[#006233]">Flow</span>
                        </h1>
                        <p className="text-[10px] text-gray-500 font-medium">
                            {user.role === 'ADMINISTRATEUR' ? 'Administrateur' : 'Espace Demandeur'} · Jorf Lasfar
                        </p>
                    </div>
                </div>

                {/* Menu + Profil */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 text-sm font-medium">
                        {user.role === 'DEMANDEUR' ? (
                            <>
                                <Link to="/creer-demande" className="text-gray-600 hover:text-[#006233] transition">
                                    <i className="fas fa-file-alt mr-1"></i> Nouvelle demande
                                </Link>
                                <Link to="/suivi-demandes" className="text-gray-600 hover:text-[#006233] transition">
                                    <i className="fas fa-list-check mr-1"></i> Mes demandes
                                </Link>
                                <Link to="/notifications" className="text-gray-600 hover:text-[#006233] transition relative">
                                    <i className="fas fa-bell mr-1"></i> Notifications
                                    {notifCount > 0 && (
                                        <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                                            {notifCount}
                                        </span>
                                    )}
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/admin/dashboard" className="text-gray-600 hover:text-[#006233] transition">
                                    <i className="fas fa-chart-pie mr-1"></i> Dashboard
                                </Link>
                                <Link to="/admin/demandes" className="text-gray-600 hover:text-[#006233] transition">
                                    <i className="fas fa-table mr-1"></i> Toutes les demandes
                                </Link>
                            </>
                        )}
                    </div>

                    {/* ✅ Profil utilisateur + Mon compte + Déconnexion */}
                    <div className="flex items-center gap-3 bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-2 rounded-full shadow-inner">
                        <div className="bg-[#006233] w-7 h-7 rounded-full flex items-center justify-center shadow-md">
                            <i className="fas fa-user text-white text-xs"></i>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                            {user.nom} {user.prenom}
                        </span>

                        {/* ✅ Lien Mon compte (avec icône) */}
                        <Link
                            to="/mon-compte"
                            className="text-gray-500 hover:text-[#006233] transition-all"
                            title="Mon compte"
                        >
                            <i className="fas fa-user-cog"></i>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="text-gray-500 hover:text-red-500 transition-all"
                            title="Déconnexion"
                        >
                            <i className="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;