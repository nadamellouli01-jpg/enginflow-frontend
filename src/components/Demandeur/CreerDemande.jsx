import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import toast from 'react-hot-toast';

const CreerDemande = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [loadingEngins, setLoadingEngins] = useState(false);
    const [formData, setFormData] = useState({
        typeEngin: 'CAMION',
        codeInventaire: '',
        dateHeureDebut: '',
        dateHeureFin: '',
        lieu: '',
        motif: ''
    });
    const [enginsDisponibles, setEnginsDisponibles] = useState([]);
    const [files, setFiles] = useState({
        ordreMission: null,
        planMaintenance: null
    });
    const [fileNames, setFileNames] = useState({
        ordreMission: 'Aucun fichier',
        planMaintenance: 'Aucun fichier'
    });

    const ordreInputRef = useRef(null);
    const planInputRef = useRef(null);

    useEffect(() => {
        fetchEngins();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.typeEngin]);

    const fetchEngins = async () => {
        setLoadingEngins(true);
        try {
            const response = await api.get(`/engins/type?type=${formData.typeEngin}`);
            setEnginsDisponibles(response.data);
            if (response.data.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    codeInventaire: response.data[0].codeInventaire
                }));
            } else {
                setFormData(prev => ({ ...prev, codeInventaire: '' }));
            }
        } catch (error) {
            console.error('Erreur:', error);
            setEnginsDisponibles([]);
        } finally {
            setLoadingEngins(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setFiles({ ...files, [type]: file });
            setFileNames({ ...fileNames, [type]: file.name });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ✅ Messages d'erreur clairs
        if (!user || !user.id) {
            toast.error('🔒 Veuillez vous reconnecter pour continuer');
            return;
        }

        if (!formData.typeEngin || !formData.codeInventaire || !formData.dateHeureDebut || !formData.dateHeureFin || !formData.lieu) {
            toast.error('⚠️ Tous les champs obligatoires doivent être remplis');
            return;
        }

        if (!files.ordreMission || !files.planMaintenance) {
            toast.error('📎 L\'Ordre de mission et le Plan de maintenance sont obligatoires');
            return;
        }

        if (new Date(formData.dateHeureDebut) >= new Date(formData.dateHeureFin)) {
            toast.error('📅 La date de fin doit être postérieure à la date de début');
            return;
        }

        setLoading(true);

        const formDataToSend = new FormData();
        formDataToSend.append('dateHeureDebut', formData.dateHeureDebut);
        formDataToSend.append('dateHeureFin', formData.dateHeureFin);
        formDataToSend.append('lieu', formData.lieu);
        formDataToSend.append('motif', formData.motif || 'Non spécifié');
        formDataToSend.append('utilisateurId', user.id);
        formDataToSend.append('codeInventaire', formData.codeInventaire);
        formDataToSend.append('ordreMission', files.ordreMission);
        formDataToSend.append('planMaintenance', files.planMaintenance);

        try {
            await api.post('/demandes', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('✅ Demande soumise avec succès !');
            setFormData({
                typeEngin: 'CAMION',
                codeInventaire: '',
                dateHeureDebut: '',
                dateHeureFin: '',
                lieu: '',
                motif: ''
            });
            setFiles({ ordreMission: null, planMaintenance: null });
            setFileNames({ ordreMission: 'Aucun fichier', planMaintenance: 'Aucun fichier' });
            if (ordreInputRef.current) ordreInputRef.current.value = '';
            if (planInputRef.current) planInputRef.current.value = '';
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('❌ Erreur lors de la soumission de la demande');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-3 sm:p-6">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
                <div className="flex flex-wrap items-center justify-between border-b pb-3 mb-4 sm:mb-5">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                        <i className="fas fa-file-alt text-[#006233] mr-2"></i>Nouvelle demande d'engin
                    </h2>
                    <span className="bg-red-100 text-red-700 text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full font-semibold">
                        * Champs obligatoires
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    {/* Type d'engin */}
                    <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                            Type d'engin <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="typeEngin"
                            value={formData.typeEngin}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-[#006233] focus:border-transparent outline-none transition"
                        >
                            <option value="CAMION">🚛 Camion</option>
                            <option value="GRUE">🏗️ Grue</option>
                            <option value="PLATEFORME">📦 Plateforme élévatrice</option>
                        </select>
                    </div>

                    {/* Engin disponible */}
                    <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                            Capacité <span className="text-red-500">*</span>
                        </label>
                        {loadingEngins ? (
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <i className="fas fa-spinner fa-spin"></i> Chargement des engins...
                            </div>
                        ) : enginsDisponibles.length === 0 ? (
                            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">
                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                Aucun engin disponible pour ce type
                            </div>
                        ) : (
                            <select
                                name="codeInventaire"
                                value={formData.codeInventaire}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-[#006233] focus:border-transparent outline-none transition"
                                required
                            >
                                {enginsDisponibles.map((engin) => (
                                    <option key={engin.codeInventaire} value={engin.codeInventaire}>
                                        {engin.codeInventaire} - {engin.capacite}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                                Début <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="dateHeureDebut"
                                value={formData.dateHeureDebut}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-[#006233] focus:border-transparent outline-none transition"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                                Fin <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="dateHeureFin"
                                value={formData.dateHeureFin}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-[#006233] focus:border-transparent outline-none transition"
                                required
                            />
                        </div>
                    </div>

                    {/* Lieu */}
                    <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                            Lieu <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="lieu"
                            placeholder="Zone d'intervention"
                            value={formData.lieu}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-[#006233] focus:border-transparent outline-none transition"
                            required
                        />
                    </div>

                    {/* Motif */}
                    <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Motif</label>
                        <textarea
                            name="motif"
                            rows="2"
                            placeholder="Nature de l'intervention..."
                            value={formData.motif}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-[#006233] focus:border-transparent outline-none transition"
                        />
                    </div>

                    {/* Upload fichiers */}
                    <div className="border-t pt-3 sm:pt-4">
                        <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                            <i className="fas fa-paperclip text-[#006233] mr-1"></i> Documents obligatoires
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {/* Ordre de mission */}
                            <div
                                className="border-2 border-dashed border-gray-300 hover:border-[#006233] rounded-xl p-3 sm:p-4 text-center cursor-pointer transition bg-gray-50 hover:bg-[#e8f3ed]"
                                onClick={() => ordreInputRef.current?.click()}
                            >
                                <i className="fas fa-envelope-open-text text-[#006233] text-xl sm:text-2xl"></i>
                                <p className="text-xs sm:text-sm font-medium mt-1">Ordre de mission</p>
                                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{fileNames.ordreMission}</p>
                                <input
                                    type="file"
                                    ref={ordreInputRef}
                                    className="hidden"
                                    accept=".pdf,.jpg,.png,.docx"
                                    onChange={(e) => handleFileChange(e, 'ordreMission')}
                                />
                            </div>

                            {/* Plan de maintenance */}
                            <div
                                className="border-2 border-dashed border-gray-300 hover:border-[#006233] rounded-xl p-3 sm:p-4 text-center cursor-pointer transition bg-gray-50 hover:bg-[#e8f3ed]"
                                onClick={() => planInputRef.current?.click()}
                            >
                                <i className="fas fa-chalkboard-user text-[#006233] text-xl sm:text-2xl"></i>
                                <p className="text-xs sm:text-sm font-medium mt-1">Plan de maintenance</p>
                                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{fileNames.planMaintenance}</p>
                                <input
                                    type="file"
                                    ref={planInputRef}
                                    className="hidden"
                                    accept=".pdf,.jpg,.png,.docx"
                                    onChange={(e) => handleFileChange(e, 'planMaintenance')}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-ocp w-full text-white font-semibold py-2.5 sm:py-3 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                        <i className="fas fa-paper-plane"></i>
                        {loading ? 'Envoi en cours...' : 'Soumettre la demande'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreerDemande;