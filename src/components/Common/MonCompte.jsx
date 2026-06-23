import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import toast from 'react-hot-toast';

const MonCompte = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        ancienMotDePasse: '',
        nouveauMotDePasse: '',
        confirmationMotDePasse: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.nouveauMotDePasse !== formData.confirmationMotDePasse) {
            toast.error('❌ Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.nouveauMotDePasse.length < 6) {
            toast.error('❌ Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);
        try {
            await api.put('/utilisateurs/me/mot-de-passe', null, {
                params: {
                    ancienMotDePasse: formData.ancienMotDePasse,
                    nouveauMotDePasse: formData.nouveauMotDePasse
                }
            });
            toast.success('✅ Mot de passe modifié avec succès !');
            setFormData({
                ancienMotDePasse: '',
                nouveauMotDePasse: '',
                confirmationMotDePasse: ''
            });
        } catch (error) {
            const message = error.response?.data || 'Erreur lors du changement';
            toast.error(`❌ ${message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 border-b pb-3 mb-6">
                    <div className="bg-[#006233]/10 p-2 rounded-full">
                        <i className="fas fa-user-circle text-[#006233] text-2xl"></i>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Mon compte</h2>
                        <p className="text-sm text-gray-500">Gérer vos informations personnelles</p>
                    </div>
                </div>

                {/* Informations (lecture seule) */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-xl">
                        <span className="text-xs text-gray-500">Nom</span>
                        <p className="font-semibold text-gray-800">{user?.nom || '—'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                        <span className="text-xs text-gray-500">Prénom</span>
                        <p className="font-semibold text-gray-800">{user?.prenom || '—'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl col-span-2">
                        <span className="text-xs text-gray-500">Email</span>
                        <p className="font-semibold text-gray-800">{user?.email || '—'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl col-span-2">
                        <span className="text-xs text-gray-500">Rôle</span>
                        <p className="font-semibold text-gray-800">
                            {user?.role === 'ADMINISTRATEUR' ? '🛡️ Administrateur' : '👤 Demandeur'}
                        </p>
                    </div>
                </div>

                {/* Changer le mot de passe */}
                <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <i className="fas fa-key text-[#006233]"></i>
                        Changer le mot de passe
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ancien mot de passe <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                name="ancienMotDePasse"
                                value={formData.ancienMotDePasse}
                                onChange={handleChange}
                                placeholder="Entrez votre ancien mot de passe"
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#006233] focus:border-transparent outline-none transition"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nouveau mot de passe <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                name="nouveauMotDePasse"
                                value={formData.nouveauMotDePasse}
                                onChange={handleChange}
                                placeholder="Entrez votre nouveau mot de passe (min 6 caractères)"
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#006233] focus:border-transparent outline-none transition"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmer le mot de passe <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                name="confirmationMotDePasse"
                                value={formData.confirmationMotDePasse}
                                onChange={handleChange}
                                placeholder="Confirmez votre nouveau mot de passe"
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#006233] focus:border-transparent outline-none transition"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#006233] hover:bg-[#004525] text-white font-semibold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
                        >
                            <i className="fas fa-save"></i>
                            {loading ? 'Modification en cours...' : 'Modifier le mot de passe'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MonCompte;