import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, Shield, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        role: 'etudiant',
        filiere: '',
        niveau: '',
        numero_etudiant: '',
        telephone: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.password2) {
            return toast.error("Les mots de passe ne correspondent pas");
        }

        setLoading(true);
        try {
            await register(formData);
            toast.success("Compte créé avec succès ! Connectez-vous.");
            navigate('/login');
        } catch (error) {
            console.error("Erreur inscription", error);
            const msg = error.response?.data?.detail ||
                Object.values(error.response?.data || {}).flat().join(', ') ||
                "L'inscription a échoué. Vérifiez vos informations.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 text-white shadow-xl shadow-primary-200 mb-4 animate-bounce-slow">
                        <GraduationCap size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">E-SUIVI</h1>
                    <p className="text-slate-500 mt-2 font-medium">Rejoignez la plateforme académique innovante</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Role Selector */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'etudiant' })}
                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${formData.role === 'etudiant'
                                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                                        : 'border-slate-100 hover:border-slate-200 text-slate-500'
                                    }`}
                            >
                                <User size={20} />
                                <span className="text-xs font-bold uppercase tracking-wider">Étudiant</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'admin' })}
                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${formData.role === 'admin'
                                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                                        : 'border-slate-100 hover:border-slate-200 text-slate-500'
                                    }`}
                            >
                                <Shield size={20} />
                                <span className="text-xs font-bold uppercase tracking-wider">Admin</span>
                            </button>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Nom d'utilisateur"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all font-medium"
                                    required
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Adresse Email"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all font-medium"
                                    required
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Additional Student Fields */}
                            {formData.role === 'etudiant' && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            name="filiere"
                                            placeholder="Filière (ex: INFO)"
                                            className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all font-medium text-sm"
                                            required
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            name="niveau"
                                            placeholder="Niveau (ex: L1)"
                                            className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all font-medium text-sm"
                                            required
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="relative group col-span-2">
                                        <input
                                            type="text"
                                            name="numero_etudiant"
                                            placeholder="Numéro Étudiant / Matricule"
                                            className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all font-medium text-sm"
                                            required
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Mot de passe"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all font-medium"
                                    required
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                                <input
                                    type="password"
                                    name="password2"
                                    placeholder="Confirmer le mot de passe"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all font-medium"
                                    required
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 hover:shadow-primary-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Créer mon compte
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-slate-500 font-medium">
                        Déjà inscrit ?{' '}
                        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold border-b-2 border-primary-100 hover:border-primary-600 transition-all pb-0.5">
                            Se connecter
                        </Link>
                    </p>
                </div>

                <p className="text-center mt-8 text-slate-400 text-sm font-medium">
                    © 2026 E-Suivi • Système de Gestion Académique
                </p>
            </div>
        </div>
    );
};

export default Register;
