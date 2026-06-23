import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(email, motDePasse);
        if (result.success) {
            toast.success('Connexion réussie !');
            navigate('/');
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-[92vh] flex items-center justify-center bg-cover bg-center relative"
            style={{ backgroundImage: `linear-gradient(135deg, rgba(0,98,51,0.92), rgba(0,69,37,0.88)), url('https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=1200')` }}>

            <div className="absolute inset-0 bg-black/20"></div>

            <div className="relative z-10 w-full max-w-md px-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/40">

                    {/* Logo OCP */}
                    <div className="flex justify-center mb-4">
                        <div className="bg-white w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
                            <img src="/ocp.png" alt="OCP" className="w-16 h-16 object-contain"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/80x80?text=OCP'; }} />
                        </div>
                    </div>

                    {/* Titre */}
                    <div className="text-center mb-5">
                        <h1 className="text-3xl font-extrabold tracking-tight">
                            <span className="text-gray-800">Engin</span><span className="text-[#006233]">Flow</span>
                        </h1>
                        <p className="text-gray-600 text-sm font-medium mt-2 tracking-wide">
                            Plateforme d'affectation d'engins
                        </p>
                        <p className="text-gray-500 text-xs mt-1">Site Industriel de Jorf Lasfar</p>
                        <div className="w-16 h-1 bg-[#c9a03d] mx-auto mt-4 rounded-full"></div>
                    </div>

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                <i className="fas fa-user mr-2 text-[#006233]"></i>Identifiant
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-[#006233] focus:border-transparent outline-none transition"
                                placeholder="ex: jean@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                <i className="fas fa-lock mr-2 text-[#006233]"></i>Mot de passe
                            </label>
                            <input
                                type="password"
                                value={motDePasse}
                                onChange={(e) => setMotDePasse(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-[#006233] focus:border-transparent outline-none transition"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-sm text-gray-600">
                                <input type="checkbox" className="rounded border-gray-300 text-[#006233] focus:ring-[#006233]" />
                                <span className="ml-2">Se souvenir</span>
                            </label>

                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#006233] hover:bg-[#004525] w-full text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 text-base transition"
                        >
                            <i className="fas fa-sign-in-alt"></i>
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-600 mt-5">
                        Pas de compte ?{' '}
                        <Link to="/inscription" className="text-[#006233] font-medium hover:underline">
                            S'inscrire
                        </Link>
                    </p>
                </div>

                <div className="text-center text-white/80 text-xs mt-5">
                    <i className="fas fa-shield-alt mr-1"></i> Environnement sécurisé - Groupe OCP
                </div>
            </div>
        </div>
    );
};

export default Login;