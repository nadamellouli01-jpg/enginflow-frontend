import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        enAttente: 0,
        approuvees: 0,
        modifiees: 0,
        refusees: 0,
        cloturees: 0
    });

    const [demandesRecentes, setDemandesRecentes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const statsResponse = await api.get('/demandes/statistiques');
            setStats(statsResponse.data);

            const demandesResponse = await api.get('/demandes?statut=EN_ATTENTE');

            const sorted = (demandesResponse.data || []).sort(
                (a, b) => new Date(b.dateCreation) - new Date(a.dateCreation)
            );

            setDemandesRecentes(sorted.slice(0, 8));
        } catch (error) {
            toast.error('Erreur lors du chargement');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';

        return new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            EN_ATTENTE:
                'bg-blue-100 text-blue-700 border border-blue-200',
            APPROUVEE:
                'bg-green-100 text-green-700 border border-green-200',
            REFUSEE:
                'bg-red-100 text-red-700 border border-red-200',
            MODIFIEE:
                'bg-yellow-100 text-yellow-700 border border-yellow-200',
            CLOTUREE:
                'bg-gray-100 text-gray-700 border border-gray-200'
        };

        const labels = {
            EN_ATTENTE: 'En attente',
            APPROUVEE: 'Approuvée',
            REFUSEE: 'Refusée',
            MODIFIEE: 'Modifiée',
            CLOTUREE: 'Clôturée'
        };

        return (
            <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}
            >
                {labels[status] || status}
            </span>
        );
    };

    const statCards = [
        {
            title: 'Total demandes',
            value: stats.total,
            icon: 'fa-chart-line',
            color: 'bg-indigo-500'
        },
        {
            title: 'En attente',
            value: stats.enAttente,
            icon: 'fa-clock',
            color: 'bg-blue-500'
        },
        {
            title: 'Approuvées',
            value: stats.approuvees,
            icon: 'fa-check',
            color: 'bg-green-500'
        },
        {
            title: 'Modifiées',
            value: stats.modifiees,
            icon: 'fa-pen',
            color: 'bg-yellow-500'
        },
        {
            title: 'Refusées',
            value: stats.refusees,
            icon: 'fa-times',
            color: 'bg-red-500'
        },
        {
            title: 'Clôturées',
            value: stats.cloturees,
            icon: 'fa-lock',
            color: 'bg-gray-500'
        }
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-14 h-14 border-4 border-[#006233] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-500">
                        Chargement du tableau de bord...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">

                {/* Header */}

                <div className="bg-gradient-to-r from-[#006233] to-[#00884A] rounded-2xl px-6 py-4 text-white shadow-md mb-6">
                    <div className="flex items-center gap-3">
                        <i className="fas fa-chart-pie text-xl"></i>

                        <div>
                            <h1 className="text-xl font-bold">
                                Tableau de Bord Administrateur
                            </h1>

                            <p className="text-sm text-green-100">
                                Gestion des demandes d'affectation d'engins industriels
                            </p>
                        </div>
                    </div>
                </div>

                {/* Statistiques */}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {statCards.map((card) => (
                        <div
                            key={card.title}
                            className="bg-white rounded-2xl p-5 shadow-sm border hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="flex justify-between items-center">

                                <div>
                                    <p className="text-sm text-gray-500">
                                        {card.title}
                                    </p>

                                    <h2 className="text-3xl font-bold text-gray-800 mt-2">
                                        {card.value}
                                    </h2>
                                </div>

                                <div
                                    className={`${card.color} w-14 h-14 rounded-2xl flex items-center justify-center`}
                                >
                                    <i
                                        className={`fas ${card.icon} text-white text-xl`}
                                    ></i>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tableau */}

                <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">

                    <div className="bg-[#006233] px-6 py-4 flex justify-between items-center">
                        <h3 className="text-white font-semibold text-lg">
                            Dernières demandes en attente
                        </h3>

                        <Link
                            to="/admin/demandes?statut=EN_ATTENTE"
                            className="text-white hover:text-green-200"
                        >
                            Voir tout →
                        </Link>
                    </div>

                    {demandesRecentes.length === 0 ? (
                        <div className="text-center py-12">
                            <i className="fas fa-inbox text-5xl text-gray-300 mb-4"></i>

                            <p className="text-gray-500">
                                Aucune demande en attente
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                            ID
                                        </th>

                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                            Engin
                                        </th>

                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                            Lieu
                                        </th>

                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                            Demandeur
                                        </th>

                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                            Date
                                        </th>

                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                            Statut
                                        </th>

                                        <th className="text-center p-4 text-sm font-semibold text-gray-600">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {demandesRecentes.map((demande) => (
                                        <tr
                                            key={demande.id}
                                            className="border-t hover:bg-gray-50 transition"
                                        >
                                            <td className="p-4 font-semibold text-gray-700">
                                                #{demande.id}
                                            </td>

                                            <td className="p-4">
                                                {demande.engin?.typeEngin || '-'}
                                            </td>

                                            <td className="p-4">
                                                {demande.lieu || '-'}
                                            </td>

                                            <td className="p-4">
                                                {demande.utilisateur?.nom || '-'}
                                            </td>

                                            <td className="p-4">
                                                {formatDate(
                                                    demande.dateCreation
                                                )}
                                            </td>

                                            <td className="p-4">
                                                {getStatusBadge(
                                                    demande.statutActuel
                                                )}
                                            </td>

                                            <td className="p-4 text-center">
                                                <Link
                                                    to={`/admin/demandes/${demande.id}`}
                                                    className="bg-[#006233] hover:bg-[#004d27] text-white px-4 py-2 rounded-lg text-sm transition"
                                                >
                                                    Consulter
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}

                                </tbody>

                            </table>

                        </div>
                    )}
                </div>

                {/* Footer */}

                <div className="mt-6 text-center text-gray-400 text-sm">
                    Dernière mise à jour :
                    {' '}
                    {new Date().toLocaleString('fr-FR')}
                </div>

            </div>
        </div>
    );
};

export default Dashboard;