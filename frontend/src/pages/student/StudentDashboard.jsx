import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, BookOpen, Calculator, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const StatCard = ({ title, value, icon: Icon, trend, className }) => (
    <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 ${className}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{value !== null ? value : '-'}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
                <Icon className="w-6 h-6 text-primary-600" />
            </div>
        </div>
        {trend && (
            <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">{trend}</span>
                <span className="text-gray-400 ml-2">vs semestre dernier</span>
            </div>
        )}
    </div>
);

const StudentDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?.id_student) { setLoading(false); return; }
            try {
                const statsRes = await api.get(`/academic/etudiants/${user.id_student}/statistiques/`);
                setStats(statsRes.data);
                const suggRes = await api.get(`/academic/etudiants/${user.id_student}/suggestions/`);
                setSuggestions(suggRes.data);
            } catch (err) {
                console.error("Erreur chargement dashboard", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [user?.id_student]);

    if (loading) return <div className="h-full flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

    const chartData = stats?.moyennes_par_matiere
        ? Object.entries(stats.moyennes_par_matiere).map(([name, val]) => ({
            name: name.length > 10 ? name.substring(0, 10) + '...' : name,
            moyenne: parseFloat(val).toFixed(2),
        }))
        : [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                    Bonjour, {user?.username} 👋
                </h1>
                <span className="text-sm text-gray-500">Mise à jour à l'instant</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Moyenne Générale" value={stats?.moyenne_generale ? `${stats.moyenne_generale}/20` : 'N/A'} icon={Calculator} />
                <StatCard title="Notes Validées" value={stats?.total_notes || 0} icon={BookOpen} />
                <StatCard title="Matière Forte" value={stats?.matiere_forte || 'Aucune'} icon={TrendingUp} />
                <StatCard title="À Améliorer" value={stats?.matiere_faible || 'Aucune'} icon={AlertCircle} className="border-orange-100" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Moyennes par matière</h3>
                    <div className="h-80 w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 20]} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#f3f4f6' }} />
                                    <Bar dataKey="moyenne" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                Pas encore assez de données
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100">
                    <div className="flex items-center mb-4">
                        <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                            <span className="text-xl">🤖</span>
                        </div>
                        <h3 className="text-lg font-bold text-indigo-900">L'IA vous conseille</h3>
                    </div>
                    <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
                        {suggestions.length > 0 ? suggestions.slice(0, 3).map((sugg) => (
                            <div key={sugg.id_suggestion} className="bg-white p-4 rounded-lg shadow-sm border border-indigo-50">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{sugg.matiere}</span>
                                    <span className="text-xs text-gray-400">Niv {sugg.exercice?.niveau}</span>
                                </div>
                                <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{sugg.exercice?.titre}</h4>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{sugg.raison}</p>
                                <button className="w-full text-center text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 py-2 rounded transition-colors">
                                    Faire cet exercice
                                </button>
                            </div>
                        )) : (
                            <div className="text-sm text-indigo-600/70 text-center py-8">
                                Votre profil est en cours d'analyse par notre IA...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
