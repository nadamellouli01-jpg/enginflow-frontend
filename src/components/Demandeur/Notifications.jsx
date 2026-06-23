import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import toast from 'react-hot-toast';

const Notifications = () => {
    const { user } = useAuth();
    const [demandesModifiees, setDemandesModifiees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetchNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await api.get('/demandes/modifiees');
            setDemandesModifiees(response.data);
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('❌ Erreur lors du chargement des notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        try {
            await api.put(`/demandes/${id}/utilisateur/accepter?utilisateurId=${user.id}`);
            toast.success('✅ Modification acceptée avec succès !');
            fetchNotifications();
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('❌ Erreur lors de l\'acceptation. Veuillez réessayer.');
        }
    };

    const handleReject = async (id) => {
        try {
            await api.put(`/demandes/${id}/utilisateur/refuser?utilisateurId=${user.id}`);
            toast.success('❌ Modification refusée avec succès');
            fetchNotifications();
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('❌ Erreur lors du refus. Veuillez réessayer.');
        }
    };

    const toggleDetails = (id) => {
        setExpandedId(expandedId === id ? null : id);
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

    // Récupérer les modifications avec ancienne et nouvelle valeur
    const getModifications = (demande) => {
        const modifs = [];

        if (demande.modificationsProposees) {
            try {
                const parsed = JSON.parse(demande.modificationsProposees);

                Object.keys(parsed).forEach((champ) => {
                    const change = parsed[champ];
                    modifs.push({
                        champ: champ === 'dateHeureDebut' ? 'Début' :
                            champ === 'dateHeureFin' ? 'Fin' :
                                champ === 'lieu' ? 'Lieu' :
                                    champ === 'motif' ? 'Motif' :
                                        champ === 'codeInventaire' ? 'Engin' : champ,
                        ancien: formatDate(change.ancien) || change.ancien,
                        nouveau: formatDate(change.nouveau) || change.nouveau
                    });
                });
            } catch (e) {
                console.error('Erreur parsing JSON:', e);
            }
        }

        return modifs;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin text-3xl text-[#006233]"></i>
                    <p className="text-gray-500 mt-2">Chargement des notifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-3 sm:p-6">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
                <div className="flex flex-wrap items-center justify-between border-b pb-3 mb-4 sm:mb-5">
                    <div className="flex items-center gap-2">
                        <i className="fas fa-bell text-[#006233] text-lg sm:text-xl"></i>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Notifications</h2>
                    </div>
                    <span className="bg-amber-100 text-amber-700 text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full font-semibold">
                        {demandesModifiees.length} modification(s)
                    </span>
                </div>

                {demandesModifiees.length === 0 ? (
                    <div className="text-center py-10 sm:py-12">
                        <i className="fas fa-check-circle text-3xl sm:text-4xl text-green-300 mb-3"></i>
                        <p className="text-gray-400 text-sm sm:text-base">Aucune notification</p>
                        <p className="text-xs sm:text-sm text-gray-400">Toutes vos demandes sont à jour</p>
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {demandesModifiees.map((demande) => {
                            const modifications = getModifications(demande);
                            const isExpanded = expandedId === demande.id;

                            return (
                                <div key={demande.id} className="bg-amber-50 rounded-xl p-3 sm:p-4 border border-amber-200">
                                    {/* En-tête */}
                                    <div className="flex flex-wrap justify-between items-start mb-2">
                                        <div>
                                            <span className="font-bold text-amber-800 text-sm sm:text-base">Demande #{demande.id}</span>
                                            <p className="text-xs sm:text-sm text-gray-600">
                                                {demande.engin?.typeEngin || '—'} • {demande.lieu || '—'}
                                            </p>
                                        </div>
                                        <span className="bg-amber-200 text-amber-700 text-[10px] sm:text-xs px-2 py-1 rounded-full font-semibold">
                                            ✏️ Modifiée
                                        </span>
                                    </div>

                                    {/* 💬 Commentaire de l'admin */}
                                    {demande.commentaireAdmin && (
                                        <div className="bg-white p-2 sm:p-3 rounded-lg border border-amber-100 mb-2 sm:mb-3">
                                            <p className="text-xs sm:text-sm text-gray-700">
                                                <span className="font-semibold text-amber-700">💬 Admin :</span> {demande.commentaireAdmin}
                                            </p>
                                        </div>
                                    )}

                                    {/* ✏️ Modifications proposées */}
                                    {modifications.length > 0 && (
                                        <div className="bg-white p-2 sm:p-3 rounded-lg border border-amber-100 mb-2 sm:mb-3">
                                            <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">✏️ Modifications proposées :</p>
                                            <div className="space-y-0.5 sm:space-y-1">
                                                {modifications.map((mod, index) => (
                                                    <div key={index} className="text-xs sm:text-sm flex flex-wrap items-center gap-1 sm:gap-2">
                                                        <span className="font-medium text-gray-600">{mod.champ} :</span>
                                                        <span className="text-red-500 line-through text-[10px] sm:text-xs">{mod.ancien}</span>
                                                        <span className="text-gray-400">→</span>
                                                        <span className="text-green-600 font-medium text-[10px] sm:text-xs">{mod.nouveau}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Boutons */}
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                                        <button
                                            onClick={() => toggleDetails(demande.id)}
                                            className="text-[#006233] hover:text-[#004525] text-xs sm:text-sm font-medium underline-offset-2 hover:underline transition"
                                        >
                                            <i className="fas fa-chevron-down mr-1"></i>
                                            {isExpanded ? 'Masquer les détails' : 'Voir les détails complets'}
                                        </button>

                                        <button
                                            onClick={() => handleAccept(demande.id)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-2 transition"
                                        >
                                            <i className="fas fa-check"></i> Accepter
                                        </button>

                                        <button
                                            onClick={() => handleReject(demande.id)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-2 transition"
                                        >
                                            <i className="fas fa-times"></i> Refuser
                                        </button>
                                    </div>

                                    {/* Détails complets */}
                                    {isExpanded && (
                                        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                                            <h4 className="font-semibold text-gray-700 text-sm sm:text-base mb-2 sm:mb-3">📄 Détails complets</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                                                <div><span className="font-medium text-gray-500">ID :</span> #{demande.id}</div>
                                                <div><span className="font-medium text-gray-500">Type :</span> {demande.engin?.typeEngin || '—'}</div>
                                                <div><span className="font-medium text-gray-500">Début :</span> {formatDate(demande.dateHeureDebut)}</div>
                                                <div><span className="font-medium text-gray-500">Fin :</span> {formatDate(demande.dateHeureFin)}</div>
                                                <div><span className="font-medium text-gray-500">Lieu :</span> {demande.lieu || '—'}</div>
                                                <div><span className="font-medium text-gray-500">Motif :</span> {demande.motif || '—'}</div>
                                                <div><span className="font-medium text-gray-500">Statut :</span>
                                                    <span className="bg-amber-200 text-amber-700 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ml-1">MODIFIEE</span>
                                                </div>
                                                <div><span className="font-medium text-gray-500">Engin :</span> {demande.engin?.codeInventaire || '—'}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;