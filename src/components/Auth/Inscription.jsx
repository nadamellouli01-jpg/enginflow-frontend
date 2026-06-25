import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Inscription = () => {
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        motDePasse: ''
        // ✅ Supprimé 'role' car toujours DEMANDEUR
    });
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // ✅ Le rôle est toujours DEMANDEUR
        const data = { ...formData, role: 'DEMANDEUR' };
        const result = await register(data);
        if (result.success) {
            toast.success('Inscription réussie ! Connectez-vous.');
            navigate('/login');
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
            style={{ backgroundImage: `linear-gradient(135deg, rgba(0,98,51,0.92), rgba(0,69,37,0.88)), url('https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=1200')` }}>

            <div className="absolute inset-0 bg-black/20"></div>

            <div className="relative z-10 w-full max-w-md px-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/40">

                    {/* Logo OCP */}
                    <div className="flex justify-center mb-4">
                        <div className="bg-white w-24 h-24 rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
                            <img src="/ocp.png" alt="OCP" className="w-20 h-20 object-contain"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/80x80?text=OCP'; }} />
                        </div>
                    </div>

                    {/* Titre */}
                    <div className="text-center mb-6">
                        <h1 className="text-4xl font-extrabold tracking-tight">
                            <span className="text-gray-800">Engin</span><span className="text-[#006233]">Flow</span>
                        </h1>
                        <p className="text-gray-600 text-sm font-medium mt-2">
                            Créer votre compte
                        </p>
                        <p className="text-gray-400 text-xs mt-1">Site Industriel de Jorf Lasfar</p>
                        <div className="w-16 h-1 bg-[#c9a03d] mx-auto mt-4 rounded-full"></div>
                    </div>

                    {/* Formulaire - Sans select de rôle */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                name="nom"
                                placeholder="Nom *"
                                value={formData.nom}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#006233] focus:border-transparent outline-none transition"
                                required
                            />
                        </div>

                        <div>
                            <input
                                type="text"
                                name="prenom"
                                placeholder="Prénom *"
                                value={formData.prenom}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#006233] focus:border-transparent outline-none transition"
                                required
                            />
                        </div>

                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email *"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#006233] focus:border-transparent outline-none transition"
                                required
                            />
                        </div>

                        <div>
                            <input
                                type="password"
                                name="motDePasse"
                                placeholder="Mot de passe * (min 6 caractères)"
                                value={formData.motDePasse}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#006233] focus:border-transparent outline-none transition"
                                required
                                minLength="6"
                            />
                        </div>

                        {/* ✅ Le rôle est automatiquement DEMANDEUR - Pas de select */}

                        <button
                            type="submit"
                            className="bg-[#006233] hover:bg-[#004525] w-full text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 text-base transition"
                        >
                            <i className="fas fa-user-plus"></i> S'inscrire
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-600 mt-6">
                        Déjà un compte ?{' '}
                        <Link to="/login" className="text-[#006233] font-medium hover:underline">
                            Se connecter
                        </Link>
                    </p>
                </div>

                <div className="text-center text-white/80 text-xs mt-6">
                    <i className="fas fa-shield-alt mr-1"></i> Environnement sécurisé - Groupe OCP
                </div>
            </div>
        </div>
    );
};

export default Inscription;