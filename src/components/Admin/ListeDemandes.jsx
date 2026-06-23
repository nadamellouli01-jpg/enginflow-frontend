import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import toast from 'react-hot-toast';

const ListeDemandes = () => {
    const navigate = useNavigate();
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        statut: '',
        typeEngin: '',
        dateCreation: ''
    });

    const fetchDemandes = async () => {
        setLoading(true);
        try {
            let url = '/demandes';
            const params = new URLSearchParams();
            if (filters.statut) params.append('statut', filters.statut);
            if (filters.typeEngin) params.append('typeEngin', filters.typeEngin);
            if (filters.dateCreation) params.append('dateCreation', filters.dateCreation);

            const queryString = params.toString();
            if (queryString) url += '?' + queryString;

            const response = await api.get(url);

            // ✅ Trier par statut (EN_ATTENTE en premier)
            const order = {
                'EN_ATTENTE': 0,
                'MODIFIEE': 1,
                'APPROUVEE': 2,
                'REFUSEE': 3,
                'CLOTUREE': 4
            };

            const sorted = response.data.sort((a, b) => {
                const orderA = order[a.statutActuel] !== undefined ? order[a.statutActuel] : 5;
                const orderB = order[b.statutActuel] !== undefined ? order[b.statutActuel] : 5;
                return orderA - orderB;
            });

            setDemandes(sorted);
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('❌ Erreur lors du chargement des demandes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDemandes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const resetFilters = () => {
        setFilters({ statut: '', typeEngin: '', dateCreation: '' });
    };

    const getStatusInfo = (statut) => {
        const map = {
            'EN_ATTENTE': { label: 'En attente', color: 'bg-blue-100 text-blue-700', icon: '⏳' },
            'APPROUVEE': { label: 'Approuvée', color: 'bg-green-100 text-green-700', icon: '✅' },
            'REFUSEE': { label: 'Refusée', color: 'bg-red-100 text-red-700', icon: '❌' },
            'MODIFIEE': { label: 'Modifiée', color: 'bg-amber-100 text-amber-700', icon: '✏️' },
            'CLOTUREE': { label: 'Clôturée', color: 'bg-gray-100 text-gray-700', icon: '🔒' }
        };
        return map[statut] || { label: statut, color: 'bg-gray-100 text-gray-700', icon: '📌' };
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

    const handleDetailClick = (id) => {
        navigate(`/admin/demandes/${id}`);
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
        <div className="max-w-7xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                {/* En-tête */}
                <div className="bg-gradient-to-r from-[#006233] to-[#008a47] px-6 py-4">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <i className="fas fa-table text-white text-xl"></i>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Liste des demandes</h2>
                                <p className="text-white/80 text-sm">Gestion des affectations d'engins</p>
                            </div>
                        </div>
                        <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">
                            {demandes.length} demande(s)
                        </span>
                    </div>
                </div>

                {/* Filtres */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-3 items-center">
                    <select
                        name="statut"
                        value={filters.statut}
                        onChange={handleFilterChange}
                        className="rounded-full px-4 py-2 text-sm border border-gray-300 bg-white focus:ring-2 focus:ring-[#006233] outline-none"
                    >
                        <option value="">📊 Tous statuts</option>
                        <option value="EN_ATTENTE">⏳ En attente</option>
                        <option value="APPROUVEE">✅ Approuvée</option>
                        <option value="REFUSEE">❌ Refusée</option>
                        <option value="MODIFIEE">✏️ Modifiée</option>
                        <option value="CLOTUREE">🔒 Clôturée</option>
                    </select>

                    <select
                        name="typeEngin"
                        value={filters.typeEngin}
                        onChange={handleFilterChange}
                        className="rounded-full px-4 py-2 text-sm border border-gray-300 bg-white focus:ring-2 focus:ring-[#006233] outline-none"
                    >
                        <option value="">🚜 Tous types</option>
                        <option value="CAMION">🚛 Camion</option>
                        <option value="GRUE">🏗️ Grue</option>
                        <option value="PLATEFORME">📦 Plateforme</option>
                    </select>

                    <input
                        type="date"
                        name="dateCreation"
                        value={filters.dateCreation}
                        onChange={handleFilterChange}
                        className="rounded-full px-4 py-2 text-sm border border-gray-300 bg-white focus:ring-2 focus:ring-[#006233] outline-none"
                    />

                    <button
                        onClick={resetFilters}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2"
                    >
                        <i className="fas fa-undo-alt"></i> Réinitialiser
                    </button>
                </div>

                {/* Tableau */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr className="border-b">
                                <th className="px-5 py-3 text-left font-semibold text-gray-600">ID</th>
                                <th className="px-5 py-3 text-left font-semibold text-gray-600">Type</th>
                                <th className="px-5 py-3 text-left font-semibold text-gray-600">Capacité</th>
                                <th className="px-5 py-3 text-left font-semibold text-gray-600">Début</th>
                                <th className="px-5 py-3 text-left font-semibold text-gray-600">Fin</th>
                                <th className="px-5 py-3 text-left font-semibold text-gray-600">Lieu</th>
                                <th className="px-5 py-3 text-left font-semibold text-gray-600">Statut</th>
                                <th className="px-5 py-3 text-left font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {demandes.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-12 text-gray-400">
                                        <i className="fas fa-inbox text-3xl mb-2 block"></i>
                                        Aucune demande trouvée
                                    </td>
                                </tr>
                            ) : (
                                demandes.map((demande) => {
                                    const status = getStatusInfo(demande.statutActuel);
                                    return (
                                        <tr key={demande.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => handleDetailClick(demande.id)}>
                                            <td className="px-5 py-3 font-mono font-bold text-gray-700">#{demande.id}</td>
                                            <td className="px-5 py-3">{demande.engin?.typeEngin || '—'}</td>
                                            <td className="px-5 py-3 font-semibold text-[#006233]">{demande.engin?.capacite || '—'}</td>
                                            <td className="px-5 py-3">{formatDate(demande.dateHeureDebut)}</td>
                                            <td className="px-5 py-3">{formatDate(demande.dateHeureFin)}</td>
                                            <td className="px-5 py-3">{demande.lieu || '—'}</td>
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                                    {status.icon} {status.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDetailClick(demande.id); }}
                                                    className="text-[#006233] hover:text-[#004525] text-sm font-semibold underline hover:no-underline transition"
                                                >
                                                    <i className="fas fa-eye mr-1"></i> Détail
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ListeDemandes;