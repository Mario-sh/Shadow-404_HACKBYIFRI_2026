import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Search, Filter, Download, Eye } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const StudentGrades = () => {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMatiere, setFilterMatiere] = useState('');

    useEffect(() => {
        const fetchNotes = async () => {
            if (!user?.id_student) return;
            try {
                const res = await api.get(`/academic/etudiants/${user.id_student}/notes/`);
                setNotes(res.data);
            } catch (error) {
                console.error("Erreur notes", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, [user?.id_student]);

    // Dédupliquer les matières pour le filtre select
    const matieresUniques = [...new Set(notes.map(n => n.matiere_nom))];

    // Filtrer les notes localement
    const notesFiltrees = notes.filter(note => {
        const matchesSearch = note.matiere_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.type_evaluation?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMatiere = filterMatiere === '' || note.matiere_nom === filterMatiere;
        return matchesSearch && matchesMatiere;
    });

    if (loading) return <div className="mt-20"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Mes Notes & Résultats</h1>

                <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger (PDF)
                </button>
            </div>

            {/* Toolbar filtres */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher une évaluation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                        value={filterMatiere}
                        onChange={(e) => setFilterMatiere(e.target.value)}
                        className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                        <option value="">Toutes les matières</option>
                        {matieresUniques.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tableau des notes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Matière</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Évaluation</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Coefficient</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Note (/20)</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {notesFiltrees.length > 0 ? notesFiltrees.map((note) => (
                                <tr key={note.id_note} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(note.date_note).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{note.matiere_nom}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                        {note.type_evaluation}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {note.matiere_coefficient || 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold ${parseFloat(note.valeur_note) >= 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {note.valeur_note}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {note.valide ? (
                                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">Validée</span>
                                        ) : (
                                            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">En attente</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-primary-600 hover:text-primary-900 bg-primary-50 p-2 rounded-full">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        Aucune note ne correspond à vos critères.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination (placeholder) */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <p className="text-sm text-gray-700">Affichage de <span className="font-medium">{notesFiltrees.length}</span> résultats</p>
                </div>
            </div>
        </div>
    );
};

export default StudentGrades;
