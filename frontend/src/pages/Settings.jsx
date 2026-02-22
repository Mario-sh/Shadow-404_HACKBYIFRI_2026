import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Bell, Moon, Sun, Monitor, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
    const { user } = useAuth();
    const [theme, setTheme] = useState('light');
    const [notifications, setNotifications] = useState(true);

    const handleSave = () => {
        toast.success("Paramètres enregistrés (démo)");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Paramètres du Compte</h1>
                <p className="text-gray-500 text-sm">Gérez vos informations personnelles et vos préférences d'interface.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Section Profil */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary-600" />
                            Informations Personnelles
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nom d'utilisateur</label>
                                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm flex items-center">
                                    <User className="w-4 h-4 mr-2 text-gray-400" />
                                    {user?.username}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Adresse Email</label>
                                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm flex items-center">
                                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                    {user?.email}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rôle système</label>
                                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm flex items-center uppercase font-bold text-[10px] tracking-widest">
                                    <Shield className="w-4 h-4 mr-2 text-gray-400" />
                                    {user?.role}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">ID Base de données</label>
                                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm">
                                    #{user?.id}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Monitor className="w-5 h-5 text-primary-600" />
                            Préférences d'Interface
                        </h3>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Thème de l'application</p>
                                    <p className="text-xs text-gray-500">Choisissez l'apparence visuelle.</p>
                                </div>
                                <div className="flex p-1 bg-gray-100 rounded-lg">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={`p-2 rounded-md transition-all ${theme === 'light' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <Sun className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={`p-2 rounded-md transition-all ${theme === 'dark' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <Moon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Notifications Push</p>
                                    <p className="text-xs text-gray-500">Recevoir des alertes pour les nouvelles notes.</p>
                                </div>
                                <button
                                    onClick={() => setNotifications(!notifications)}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${notifications ? 'bg-primary-600' : 'bg-gray-200'}`}
                                >
                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-100 font-bold"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            Enregistrer les changements
                        </button>
                    </div>
                </div>

                {/* Sidebar d'info */}
                <div className="space-y-6">
                    <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-100">
                        <h4 className="font-bold mb-2">Besoin d'aide ?</h4>
                        <p className="text-sm text-indigo-100 mb-4 leading-relaxed">
                            Si vous rencontrez des problèmes avec votre compte ou vos accès, contactez le support technique de votre établissement.
                        </p>
                        <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/20">
                            Centre d'aide
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <p className="text-xs text-gray-400 text-center">
                            Version 1.0.0-stable<br />
                            © 2026 E-Suivi Académique
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
