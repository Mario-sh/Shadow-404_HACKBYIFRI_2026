import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminGradesValidation = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchNotesInit();
    }, []);

    const fetchNotesInit = async () => {
        try {
            // Dans ce scénario on récupère les notes non validées
            const res = await api.get('/academic/notes/?valide=False');
            setNotes(res.data || []);
        } catch (error) {
            console.error("Erreur fetching notes à valider", error);
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async (noteId) => {
        try {
            // Endpoint fictif pour valider la note (basé sur views.py vu avant)
            await api.post(`/academic/notes/${noteId}/valider/`);
            // Mettre à jour l'UI
            setNotes(notes.filter(n => n.id_note !== noteId));
            toast.success("Note validée avec succès");
        } catch (error) {
            console.error("Erreur lors de la validation", error);
            toast.error("Impossible de valider cette note");
        }
    };

    const notesFiltrees = notes.filter(n =>
        n.student_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.matiere_nom?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="mt-20"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Validation des Notes</h1>
                    <p className="text-sm text-gray-500 mt-1">Vous avez {notes.length} note(s) en attente d'officialisation.</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher par étudiant ou matière..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Étudiant</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Matière</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Note Proposée</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {notesFiltrees.length > 0 ? notesFiltrees.map((note) => (
                                <tr key={note.id_note}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{note.student_nom} {note.student_prenom}</div>
                                        <div className="text-xs text-gray-500">Matricule: {note.student}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{note.matiere_nom}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                        {note.type_evaluation}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-amber-100 text-amber-800`}>
                                            {note.valeur_note} / 20
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleValidate(note.id_note)}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Valider
                                        </button>
                                        <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                                            <XCircle className="w-4 h-4 mr-1 text-red-500" />
                                            Rejeter
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        Aucune note en attente de validation.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminGradesValidation;
