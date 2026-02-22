import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Users, BookOpen, CheckCircle, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            </div>
            <div className={`p-3 rounded-lg ${colorClass}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    </div>
);

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalEtudiants: 0,
        totalClasses: 0,
        notesAValider: 0,
        matieres: []
    });
    const [recentActivites, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGlobalStats = async () => {
            try {
                // Simulation de dashboard complet ou appel API multiples
                // Dans une vraie application on aurait une route /api/admin/dashboard/stats/
                const [etudiantsRes, classesRes, notesRes] = await Promise.all([
                    api.get('/academic/etudiants/'),
                    api.get('/academic/classes/'),
                    api.get('/academic/notes/?valide=False')
                ]);

                setStats({
                    totalEtudiants: etudiantsRes.data.length || 0,
                    totalClasses: classesRes.data.length || 0,
                    notesAValider: notesRes.data.length || 0,
                });

                // Simuler une activité récente
                setRecentActivities([
                    { id: 1, action: "Nouvel étudiant inscrit", detail: "Jean Dupont - Classe L1 INFO", date: "Il y a 10 min" },
                    { id: 2, action: "Notes soumises", detail: "Examen Mathématiques (L1 INFO)", date: "Il y a 2h" },
                    { id: 3, action: "Suggestion IA générée", detail: "5 étudiants nécessitent de l'aide en Physique", date: "Il y a 4h" },
                ]);

            } catch (error) {
                console.error("Erreur stats admin", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGlobalStats();
    }, []);

    if (loading) return <div className="mt-20"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                    Espace Administration
                </h1>
                <div className="text-sm text-gray-500">Connecté en tant que: <span className="font-semibold text-primary-600">{user?.username}</span></div>
            </div>

            {/* KPIs Globaux */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Étudiants"
                    value={stats.totalEtudiants}
                    icon={Users}
                    colorClass="bg-blue-50 text-blue-600"
                />
                <StatCard
                    title="Classes Actives"
                    value={stats.totalClasses}
                    icon={BookOpen}
                    colorClass="bg-indigo-50 text-indigo-600"
                />
                <StatCard
                    title="Notes en attente"
                    value={stats.notesAValider}
                    icon={AlertTriangle}
                    colorClass="bg-amber-50 text-amber-600"
                />
                <StatCard
                    title="Taux de réussite global"
                    value="76%"
                    icon={CheckCircle}
                    colorClass="bg-green-50 text-green-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tableau principal des étudiants récents etc */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 lg:col-span-2 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">Alertes Académiques (IA)</h3>
                        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">Voir tout</button>
                    </div>
                    <div className="p-6 flex flex-col items-center justify-center text-center h-64">
                        <AlertTriangle className="w-12 h-12 text-amber-300 mb-3" />
                        <h4 className="text-md font-medium text-gray-900">Aucun étudiant en difficulté majeure</h4>
                        <p className="text-sm text-gray-500 mt-1 max-w-sm">
                            Le moteur d'Intelligence Artificielle surveille les performances. Vous serez alerté ici si des élèves décrochent.
                        </p>
                    </div>
                </div>

                {/* Activité Récente */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="px-6 py-5 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800">Activité Récente</h3>
                    </div>
                    <div className="p-6">
                        <div className="flow-root">
                            <ul role="list" className="-mb-8">
                                {recentActivites.map((activity, activityIdx) => (
                                    <li key={activity.id}>
                                        <div className="relative pb-8">
                                            {activityIdx !== recentActivites.length - 1 ? (
                                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                            ) : null}
                                            <div className="relative flex space-x-3">
                                                <div>
                                                    <span className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center ring-8 ring-white">
                                                        <div className="w-2 h-2 bg-primary-600 rounded-full" />
                                                    </span>
                                                </div>
                                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                    <div>
                                                        <p className="text-sm text-gray-900 font-medium">{activity.action}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{activity.detail}</p>
                                                    </div>
                                                    <div className="whitespace-nowrap text-right text-xs text-gray-500">
                                                        {activity.date}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
