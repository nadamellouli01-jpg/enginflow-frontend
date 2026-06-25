import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import toast from 'react-hot-toast';

const DetailDemande = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [demande, setDemande] = useState(null);
    const [engins, setEngins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showRefuseModal, setShowRefuseModal] = useState(false);
    const [showModifyModal, setShowModifyModal] = useState(false);
    const [refuseReason, setRefuseReason] = useState('');
    const [modifyData, setModifyData] = useState({
        dateHeureDebut: '',
        dateHeureFin: '',
        lieu: '',
        motif: '',
        codeInventaire: '',
        commentaire: ''
    });

    const fetchDemande = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/demandes/${id}`);
            setDemande(response.data);
            if (response.data) {
                setModifyData({
                    dateHeureDebut: response.data.dateHeureDebut || '',
                    dateHeureFin: response.data.dateHeureFin || '',
                    lieu: response.data.lieu || '',
                    motif: response.data.motif || '',
                    codeInventaire: response.data.engin?.codeInventaire || '',
                    commentaire: ''
                });
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du chargement de la demande');
            navigate('/admin/demandes');
        } finally {
            setLoading(false);
        }
    };

    const fetchEnginsByType = async (type) => {
        if (!type) return;
        try {
            const response = await api.get(`/engins/type?type=${type}`);
            setEngins(response.data);
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    useEffect(() => {
        fetchDemande();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Quand la demande est chargée, récupérer les engins du même type
    useEffect(() => {
        if (demande && demande.engin?.typeEngin) {
            fetchEnginsByType(demande.engin.typeEngin);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [demande]);

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

    const downloadFile = async (chemin) => {
        if (!chemin) return;
        const parts = chemin.split('\\');
        const filename = parts[parts.length - 1];

        try {
            const response = await api.get(`/uploads/${filename}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success(`📄 ${filename} téléchargé avec succès`);
        } catch (error) {
            console.error('Erreur de téléchargement:', error);
            toast.error('Erreur lors du téléchargement');
        }
    };

    const handleApprouver = async () => {
        if (!window.confirm('Confirmer l\'approbation de cette demande ?')) return;
        setActionLoading(true);
        try {
            await api.put(`/demandes/${id}/approuver`, null, {
                params: { adminId: user.id, commentaire: 'Demande approuvée' }
            });
            toast.success('✅ Demande approuvée avec succès !');
            fetchDemande();
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors de l\'approbation');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRefuser = async () => {
        if (!refuseReason.trim()) {
            toast.error('Veuillez saisir un motif de refus');
            return;
        }
        setActionLoading(true);
        try {
            await api.put(`/demandes/${id}/refuser`, null, {
                params: { adminId: user.id, commentaire: refuseReason }
            });
            toast.success('❌ Demande refusée');
            setShowRefuseModal(false);
            setRefuseReason('');
            fetchDemande();
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du refus');
        } finally {
            setActionLoading(false);
        }
    };

    const handleModifier = async () => {
        if (!modifyData.commentaire.trim()) {
            toast.error('Veuillez saisir un commentaire pour la modification');
            return;
        }
        setActionLoading(true);
        try {
            const params = { adminId: user.id, commentaire: modifyData.commentaire };
            if (modifyData.dateHeureDebut) params.dateHeureDebut = modifyData.dateHeureDebut;
            if (modifyData.dateHeureFin) params.dateHeureFin = modifyData.dateHeureFin;
            if (modifyData.lieu) params.lieu = modifyData.lieu;
            if (modifyData.motif) params.motif = modifyData.motif;
            if (modifyData.codeInventaire) params.codeInventaire = modifyData.codeInventaire;

            await api.put(`/demandes/${id}/admin/modifier`, null, { params });
            toast.success('✏️ Modification proposée avec succès !');
            setShowModifyModal(false);
            fetchDemande();
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors de la modification');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin text-3xl text-[#006233]"></i>
                    <p className="text-gray-500 mt-2">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!demande) {
        return <div className="text-center py-12 text-gray-400">Demande non trouvée</div>;
    }

    const status = getStatusInfo(demande.statutActuel);

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Titre */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        <i className="fas fa-clipboard-list text-[#006233] mr-2"></i>
                        Demande #{demande.id}
                    </h2>
                    <p className="text-gray-500 text-sm">Détail complet de la demande</p>
                </div>
                <button
                    onClick={() => navigate('/admin/demandes')}
                    className="text-gray-500 hover:text-[#006233] transition"
                >
                    <i className="fas fa-arrow-left mr-1"></i> Retour
                </button>
            </div>

            {/* Informations principales */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
                <div className="grid grid-cols-2 gap-4">
                    <div><span className="text-sm text-gray-500">Type d'engin</span><p className="font-semibold">{demande.engin?.typeEngin || '—'}</p></div>
                    <div><span className="text-sm text-gray-500">Code inventaire</span><p className="font-semibold">{demande.engin?.codeInventaire || '—'}</p></div>
                    <div><span className="text-sm text-gray-500">Capacité</span><p className="font-semibold">{demande.engin?.capacite || '—'}</p></div>
                    <div><span className="text-sm text-gray-500">Statut</span><span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>{status.icon} {status.label}</span></div>
                    <div><span className="text-sm text-gray-500">Début</span><p className="font-semibold">{formatDate(demande.dateHeureDebut)}</p></div>
                    <div><span className="text-sm text-gray-500">Fin</span><p className="font-semibold">{formatDate(demande.dateHeureFin)}</p></div>
                    <div><span className="text-sm text-gray-500">Lieu</span><p className="font-semibold">{demande.lieu || '—'}</p></div>
                    <div><span className="text-sm text-gray-500">Demandeur</span><p className="font-semibold">{demande.utilisateur?.nom} {demande.utilisateur?.prenom}</p></div>
                    <div className="col-span-2"><span className="text-sm text-gray-500">Motif</span><p className="font-semibold">{demande.motif || '—'}</p></div>
                    {demande.commentaireAdmin && (
                        <div className="col-span-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
                            <span className="text-sm font-semibold text-amber-700">💬 Commentaire admin :</span>
                            <p className="text-sm">{demande.commentaireAdmin}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pièces jointes */}
            {demande.pieceJointes && demande.pieceJointes.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
                    <h3 className="font-bold text-gray-800 mb-4">
                        <i className="fas fa-paperclip text-[#006233] mr-2"></i>
                        Pièces jointes
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {demande.pieceJointes.map((piece, index) => (
                            <button
                                key={index}
                                onClick={() => downloadFile(piece.cheminStockage)}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-[#006233]/5 hover:border-[#006233] transition group w-full text-left"
                            >
                                <div className="bg-[#006233]/10 p-2 rounded-lg group-hover:bg-[#006233]/20 transition">
                                    <i className={`fas ${piece.typeDocument === 'ORDRE_MISSION' ? 'fa-envelope-open-text' : 'fa-chalkboard-user'} text-[#006233]`}></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-700 truncate">{piece.nomFichier}</p>
                                    <p className="text-xs text-gray-400">{piece.typeDocument}</p>
                                </div>
                                <i className="fas fa-download text-gray-400 group-hover:text-[#006233] transition"></i>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Historique */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
                <h3 className="font-bold text-gray-800 mb-4">
                    <i className="fas fa-history text-[#006233] mr-2"></i>
                    Historique des actions
                </h3>
                {demande.historique && demande.historique.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {demande.historique.map((action, index) => (
                            <div key={index} className="flex items-start gap-3 border-b border-gray-100 pb-3">
                                <div className="bg-[#006233]/10 p-2 rounded-full">
                                    <i className="fas fa-circle text-[#006233] text-xs"></i>
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{action.typeAction}</p>
                                    <p className="text-xs text-gray-500">{action.commentaire || '—'}</p>
                                    <p className="text-xs text-gray-400">{formatDate(action.dateAction)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm">Aucun historique</p>
                )}
            </div>

            {/* Actions ADMIN */}
            {demande.statutActuel !== 'CLOTUREE' && demande.statutActuel !== 'APPROUVEE' && demande.statutActuel !== 'REFUSEE' && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">
                        <i className="fas fa-tasks text-[#006233] mr-2"></i>
                        Actions
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleApprouver}
                            disabled={actionLoading}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition disabled:opacity-50"
                        >
                            <i className="fas fa-check-circle"></i> Approuver
                        </button>
                        <button
                            onClick={() => setShowModifyModal(true)}
                            disabled={actionLoading}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition disabled:opacity-50"
                        >
                            <i className="fas fa-edit"></i> Modifier
                        </button>
                        <button
                            onClick={() => setShowRefuseModal(true)}
                            disabled={actionLoading}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition disabled:opacity-50"
                        >
                            <i className="fas fa-times-circle"></i> Refuser
                        </button>
                    </div>
                </div>
            )}

            {demande.statutActuel === 'CLOTUREE' && (
                <div className="bg-gray-100 rounded-2xl p-6 border border-gray-200 text-center">
                    <i className="fas fa-lock text-gray-400 text-2xl mb-2"></i>
                    <p className="text-gray-500 font-semibold">Cette demande est clôturée</p>
                </div>
            )}
            {demande.statutActuel === 'APPROUVEE' && (
                <div className="bg-green-100 rounded-2xl p-6 border border-green-200 text-center">
                    <i className="fas fa-check-circle text-green-600 text-2xl mb-2"></i>
                    <p className="text-green-700 font-semibold">Cette demande est approuvée</p>
                </div>
            )}
            {demande.statutActuel === 'REFUSEE' && (
                <div className="bg-red-100 rounded-2xl p-6 border border-red-200 text-center">
                    <i className="fas fa-times-circle text-red-600 text-2xl mb-2"></i>
                    <p className="text-red-700 font-semibold">Cette demande est refusée</p>
                </div>
            )}

            {/* Modal Refuser */}
            {showRefuseModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4 border-b pb-3">
                            <div className="bg-red-100 p-2 rounded-full">
                                <i className="fas fa-ban text-red-600 text-xl"></i>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Refus de la demande</h3>
                        </div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Motif du refus *</label>
                        <textarea
                            value={refuseReason}
                            onChange={(e) => setRefuseReason(e.target.value)}
                            rows="3"
                            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 outline-none"
                            placeholder="Expliquez la raison du refus..."
                        />
                        <div className="flex gap-3 mt-6 justify-end">
                            <button
                                onClick={() => setShowRefuseModal(false)}
                                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleRefuser}
                                disabled={actionLoading}
                                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-md transition disabled:opacity-50"
                            >
                                {actionLoading ? 'En cours...' : 'Confirmer le refus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Modifier */}
            {showModifyModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-10">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4 border-b pb-3">
                            <div className="bg-amber-100 p-2 rounded-full">
                                <i className="fas fa-pen-alt text-amber-600 text-xl"></i>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Modifier la demande</h3>
                        </div>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            <div>
                                <label className="text-sm font-semibold text-gray-700">Commentaire *</label>
                                <textarea
                                    value={modifyData.commentaire}
                                    onChange={(e) => setModifyData({ ...modifyData, commentaire: e.target.value })}
                                    rows="2"
                                    className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-[#006233] outline-none"
                                    placeholder="Expliquez la modification proposée..."
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700">Nouvelle date de début</label>
                                <input
                                    type="datetime-local"
                                    value={modifyData.dateHeureDebut}
                                    onChange={(e) => setModifyData({ ...modifyData, dateHeureDebut: e.target.value })}
                                    className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-[#006233] outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700">Nouvelle date de fin</label>
                                <input
                                    type="datetime-local"
                                    value={modifyData.dateHeureFin}
                                    onChange={(e) => setModifyData({ ...modifyData, dateHeureFin: e.target.value })}
                                    className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-[#006233] outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700">Nouveau lieu</label>
                                <input
                                    type="text"
                                    value={modifyData.lieu}
                                    onChange={(e) => setModifyData({ ...modifyData, lieu: e.target.value })}
                                    className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-[#006233] outline-none"
                                    placeholder="Nouveau lieu"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700">Nouveau motif</label>
                                <textarea
                                    value={modifyData.motif}
                                    onChange={(e) => setModifyData({ ...modifyData, motif: e.target.value })}
                                    rows="2"
                                    className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-[#006233] outline-none"
                                    placeholder="Nouveau motif"
                                />
                            </div>
                            {/* ✅ Nouveau select pour l'engin (filtré par type) */}
                            <div>
                                <label className="text-sm font-semibold text-gray-700">
                                    Nouvel engin ({demande?.engin?.typeEngin || '—'})
                                </label>
                                <select
                                    value={modifyData.codeInventaire}
                                    onChange={(e) => setModifyData({ ...modifyData, codeInventaire: e.target.value })}
                                    className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-[#006233] outline-none"
                                >
                                    <option value="">-- Inchangé --</option>
                                    {engins.map((engin) => (
                                        <option key={engin.codeInventaire} value={engin.codeInventaire}>
                                            {engin.codeInventaire} - {engin.capacite}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6 justify-end">
                            <button
                                onClick={() => setShowModifyModal(false)}
                                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleModifier}
                                disabled={actionLoading}
                                className="px-5 py-2 bg-[#006233] hover:bg-[#004525] text-white rounded-xl font-medium shadow-md transition disabled:opacity-50"
                            >
                                {actionLoading ? 'En cours...' : 'Envoyer la modification'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailDemande;