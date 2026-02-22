import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Lightbulb, CheckCircle2, ArrowRight, BookOpen, BrainCircuit } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AISuggestions = () => {
    const { user } = useAuth();
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!user?.id_student) return;
            try {
                const res = await api.get(`/academic/etudiants/${user.id_student}/suggestions/`);
                setSuggestions(res.data);
            } catch (error) {
                console.error("Erreur suggestions", error);
                toast.error("Impossible de charger les suggestions IA");
            } finally {
                setLoading(false);
            }
        };
        fetchSuggestions();
    }, [user?.id_student]);

    if (loading) return <div className="mt-20"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-2 bg-indigo-100 rounded-full mb-2">
                    <BrainCircuit className="w-6 h-6 text-indigo-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Suggestions d'Apprentissage IA</h1>
                <p className="text-gray-500 max-w-lg mx-auto">
                    Notre algorithme analyse vos résultats récents pour vous proposer les meilleurs exercices afin de combler vos lacunes.
                </p>
            </div>

            {suggestions.length > 0 ? (
                <div className="grid gap-6">
                    {suggestions.map((sugg) => (
                        <div key={sugg.id_suggestion} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
                                            {sugg.matiere}
                                        </span>
                                        <span className="text-sm text-gray-400 font-medium">Niveau {sugg.exercice.niveau}</span>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{sugg.exercice.titre}</h3>
                                        <p className="text-gray-600 mt-2 leading-relaxed">
                                            {sugg.exercice.description}
                                        </p>
                                    </div>

                                    <div className="bg-amber-50 rounded-lg p-4 flex gap-3 border border-amber-100">
                                        <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <p className="text-sm text-amber-800 italic">
                                            " {sugg.raison} "
                                        </p>
                                    </div>
                                </div>

                                <div className="md:w-64 shrink-0 flex flex-col justify-center gap-3">
                                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                                        <div className="text-xs text-gray-500 uppercase font-bold tracking-tight mb-1">Impact Prévu</div>
                                        <div className="text-2xl font-black text-primary-600">+1.5 pts</div>
                                        <div className="text-xs text-gray-400">sur votre moyenne</div>
                                    </div>
                                    <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
                                        Commencer <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Pas encore de recommandations</h3>
                    <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                        Continuez à effectuer vos évaluations. L'IA générera des suggestions dès que suffisamment de données seront disponibles.
                    </p>
                </div>
            )}

            {/* Footer tips */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-10">
                <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <p className="text-xs text-gray-600">Recommandations basées sur vos erreurs types.</p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <p className="text-xs text-gray-600">Mise à jour quotidienne de votre profil cognitif.</p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <p className="text-xs text-gray-600">Accès illimité aux ressources de remédiation.</p>
                </div>
            </div>
        </div>
    );
};

export default AISuggestions;
