import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, UserPlus, Filter, MoreVertical, Mail, GraduationCap } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminStudents = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterClass, setFilterClass] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [studentsRes, classesRes] = await Promise.all([
                api.get('/academic/etudiants/'),
                api.get('/academic/classes/')
            ]);
            setStudents(studentsRes.data);
            setClasses(classesRes.data);
        } catch (error) {
            console.error("Erreur chargement données", error);
            toast.error("Échec du chargement des étudiants");
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = (
            student.nom.toLowerCase().includes(search.toLowerCase()) ||
            student.prenom.toLowerCase().includes(search.toLowerCase()) ||
            student.matricule.toLowerCase().includes(search.toLowerCase())
        );
        const matchesClass = filterClass === '' || student.classe?.id_class.toString() === filterClass;
        return matchesSearch && matchesClass;
    });

    if (loading) return <div className="mt-20"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Étudiants</h1>
                    <p className="text-gray-500 text-sm">Gérez les inscriptions et consultez les profils académiques.</p>
                </div>
                <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm text-sm font-semibold">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Nouvel Étudiant
                </button>
            </div>

            {/* Barre de Recherche et Filtres */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, prénom ou matricule..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm appearance-none bg-white"
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                        >
                            <option value="">Toutes les classes</option>
                            {classes.map(c => (
                                <option key={c.id_class} value={c.id_class}>{c.nom_class}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table des Étudiants */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Étudiant</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Matricule</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Classe</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                                <tr key={student.id_student} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold shrink-0">
                                                {student.nom.charAt(0)}{student.prenom.charAt(0)}
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-bold text-gray-900">{student.nom} {student.prenom}</p>
                                                <p className="text-xs text-gray-500">Inscrit le {new Date(student.date_inscription).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {student.matricule}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                                            {student.classe?.nom_class || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                            {student.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                        Aucun étudiant trouvé pour ces critères.
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

export default AdminStudents;
