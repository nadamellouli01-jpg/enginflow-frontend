import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import toast from 'react-hot-toast';

const SuiviDemandes = () => {
    const { user } = useAuth();
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDemandes();
    }, []);

    const fetchDemandes = async () => {
        setLoading(true);
        try {
            const response = await api.get('/demandes');
            setDemandes(response.data);
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du chargement des demandes');
        } finally {
            setLoading(false);
        }
    };

    // Filtrer les demandes de l'utilisateur connecté
    const mesDemandes = demandes.filter(d => d.utilisateur?.id === user?.id);

    const getStatusInfo = (statut) => {
        const statusMap = {
            'EN_ATTENTE': { label: 'En attente', color: 'bg-blue-100 text-blue-700', icon: '⏳' },
            'APPROUVEE': { label: 'Approuvée', color: 'bg-green-100 text-green-700', icon: '✅' },
            'REFUSEE': { label: 'Refusée', color: 'bg-red-100 text-red-700', icon: '❌' },
            'MODIFIEE': { label: 'Modifiée', color: 'bg-amber-100 text-amber-700', icon: '✏️' },
            'CLOTUREE': { label: 'Clôturée', color: 'bg-gray-100 text-gray-700', icon: '🔒' }
        };
        return statusMap[statut] || { label: statut, color: 'bg-gray-100 text-gray-700', icon: '📌' };
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin text-3xl text-[#006233]"></i>
                    <p className="text-gray-500 mt-2">Chargement des demandes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between border-b pb-3 mb-5">
                    <div className="flex items-center gap-2">
                        <i className="fas fa-list-check text-[#006233] text-xl"></i>
                        <h2 className="text-xl font-bold text-gray-800">Suivi de mes demandes</h2>
                    </div>
                    <span className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full font-semibold">
                        {mesDemandes.length} demande(s)
                    </span>
                </div>

                {mesDemandes.length === 0 ? (
                    <div className="text-center py-12">
                        <i className="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
                        <p className="text-gray-400">Aucune demande trouvée</p>
                        <p className="text-sm text-gray-400">Créez votre première demande !</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr className="border-b">
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Type</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Début</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Fin</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Lieu</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {mesDemandes.map((demande) => {
                                    const status = getStatusInfo(demande.statutActuel);
                                    return (
                                        <tr key={demande.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 font-mono font-medium text-gray-700">
                                                #{demande.id}
                                            </td>
                                            <td className="px-4 py-3">
                                                {demande.engin?.typeEngin || '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {formatDate(demande.dateHeureDebut)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {formatDate(demande.dateHeureFin)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {demande.lieu || '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                                    {status.icon} {status.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuiviDemandes;