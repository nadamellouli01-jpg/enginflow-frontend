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
            toast.error('❌ Erreur lors de l\'acceptation');
        }
    };

    const handleReject = async (id) => {
        try {
            await api.put(`/demandes/${id}/utilisateur/refuser?utilisateurId=${user.id}`);
            toast.success('❌ Modification refusée avec succès');
            fetchNotifications();
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('❌ Erreur lors du refus');
        }
    };

    const toggleDetails = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // ✅ FormatDate qui accepte les chaînes et les objets Date
    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
        if (isNaN(date.getTime())) return '—';
        return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ✅ Récupérer les modifications (tous les champs)
    const getModifications = (demande) => {
        const modifs = [];

        if (demande.modificationsProposees) {
            try {
                const parsed = JSON.parse(demande.modificationsProposees);

                Object.keys(parsed).forEach((champ) => {
                    const change = parsed[champ];

                    // Déterminer le nom du champ
                    let nomChamp = champ;
                    if (champ === 'dateHeureDebut') nomChamp = 'Début';
                    else if (champ === 'dateHeureFin') nomChamp = 'Fin';
                    else if (champ === 'lieu') nomChamp = 'Lieu';
                    else if (champ === 'motif') nomChamp = 'Motif';
                    else if (champ === 'codeInventaire') nomChamp = 'Engin';

                    // Formater les valeurs (dates ou texte)
                    let ancien = change.ancien;
                    let nouveau = change.nouveau;

                    // Si c'est une date, la formater
                    if (champ === 'dateHeureDebut' || champ === 'dateHeureFin') {
                        ancien = formatDate(change.ancien);
                        nouveau = formatDate(change.nouveau);
                    }

                    modifs.push({
                        champ: nomChamp,
                        ancien: ancien,
                        nouveau: nouveau
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
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between border-b pb-3 mb-5">
                    <div className="flex items-center gap-2">
                        <i className="fas fa-bell text-[#006233] text-xl"></i>
                        <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
                    </div>
                    <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full font-semibold">
                        {demandesModifiees.length} modification(s)
                    </span>
                </div>

                {demandesModifiees.length === 0 ? (
                    <div className="text-center py-12">
                        <i className="fas fa-check-circle text-4xl text-green-300 mb-3"></i>
                        <p className="text-gray-400">Aucune notification</p>
                        <p className="text-sm text-gray-400">Toutes vos demandes sont à jour</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {demandesModifiees.map((demande) => {
                            const modifications = getModifications(demande);
                            const isExpanded = expandedId === demande.id;

                            return (
                                <div key={demande.id} className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                                    {/* En-tête */}
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="font-bold text-amber-800">Demande #{demande.id}</span>
                                            <p className="text-sm text-gray-600">
                                                {demande.engin?.typeEngin || '—'} • {demande.lieu || '—'}
                                            </p>
                                        </div>
                                        <span className="bg-amber-200 text-amber-700 text-xs px-2 py-1 rounded-full font-semibold">
                                            ✏️ Modifiée
                                        </span>
                                    </div>

                                    {/* 💬 Commentaire de l'admin */}
                                    {demande.commentaireAdmin && (
                                        <div className="bg-white p-3 rounded-lg border border-amber-100 mb-3">
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold text-amber-700">💬 Admin :</span> {demande.commentaireAdmin}
                                            </p>
                                        </div>
                                    )}

                                    {/* ✏️ Modifications proposées (tous les champs) */}
                                    {modifications.length > 0 && (
                                        <div className="bg-white p-3 rounded-lg border border-amber-100 mb-3">
                                            <p className="text-sm font-semibold text-gray-700 mb-2">✏️ Modifications proposées :</p>
                                            <div className="space-y-1">
                                                {modifications.map((mod, index) => (
                                                    <div key={index} className="text-sm flex items-center gap-2 flex-wrap">
                                                        <span className="font-medium text-gray-600">{mod.champ} :</span>
                                                        <span className="text-red-500 line-through">{mod.ancien}</span>
                                                        <span className="text-gray-400">→</span>
                                                        <span className="text-green-600 font-medium">{mod.nouveau}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Boutons */}
                                    <div className="flex flex-wrap items-center gap-3 mt-3">
                                        <button
                                            onClick={() => toggleDetails(demande.id)}
                                            className="text-[#006233] hover:text-[#004525] text-sm font-medium underline-offset-2 hover:underline transition"
                                        >
                                            <i className="fas fa-chevron-down mr-1"></i>
                                            {isExpanded ? 'Masquer les détails' : 'Voir les détails complets'}
                                        </button>

                                        <button
                                            onClick={() => handleAccept(demande.id)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
                                        >
                                            <i className="fas fa-check"></i> Accepter
                                        </button>

                                        <button
                                            onClick={() => handleReject(demande.id)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
                                        >
                                            <i className="fas fa-times"></i> Refuser
                                        </button>
                                    </div>

                                    {/* Détails complets */}
                                    {isExpanded && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                            <h4 className="font-semibold text-gray-700 mb-3">📄 Détails complets</h4>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div><span className="font-medium text-gray-500">ID :</span> #{demande.id}</div>
                                                <div><span className="font-medium text-gray-500">Type :</span> {demande.engin?.typeEngin || '—'}</div>
                                                <div><span className="font-medium text-gray-500">Début :</span> {formatDate(demande.dateHeureDebut)}</div>
                                                <div><span className="font-medium text-gray-500">Fin :</span> {formatDate(demande.dateHeureFin)}</div>
                                                <div><span className="font-medium text-gray-500">Lieu :</span> {demande.lieu || '—'}</div>
                                                <div><span className="font-medium text-gray-500">Motif :</span> {demande.motif || '—'}</div>
                                                <div><span className="font-medium text-gray-500">Statut :</span>
                                                    <span className="bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full text-xs ml-1">MODIFIEE</span>
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